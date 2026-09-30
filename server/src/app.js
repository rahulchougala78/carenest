import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db as defaultDb } from './db.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const jwtSecret = () => process.env.JWT_SECRET || 'local-development-only-change-me';

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  dateOfBirth: user.date_of_birth,
  phone: user.phone,
  careId: user.care_id
});

const appointmentView = (row) => ({
  id: row.id,
  clinicianName: row.clinician_name,
  specialty: row.specialty,
  location: row.location,
  appointmentAt: row.appointment_at,
  type: row.type,
  status: row.status,
  queueNumber: row.queue_number,
  room: row.room,
  reason: row.reason
});

const money = (cents) => Number((cents / 100).toFixed(2));

export function createApp(database = defaultDb) {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
  app.use(express.json({ limit: '200kb' }));

  const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Sign in is required.' });
    try {
      req.user = jwt.verify(token, jwtSecret());
      return next();
    } catch {
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
  };

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.post('/api/auth/login', (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = database.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'That email or password is not recognized.' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret(), { expiresIn: '8h' });
    return res.json({ token, user: publicUser(user) });
  });

  app.use('/api', authenticate);

  app.get('/api/me', (req, res) => {
    const user = database.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    res.json({ user: publicUser(user) });
  });

  app.get('/api/dashboard', (req, res) => {
    const next = database.prepare(`SELECT * FROM appointments WHERE user_id = ? AND status = 'scheduled'
      ORDER BY appointment_at LIMIT 1`).get(req.user.id);
    const upcoming = database.prepare(`SELECT * FROM appointments WHERE user_id = ? AND status = 'scheduled'
      ORDER BY appointment_at LIMIT 3`).all(req.user.id).map(appointmentView);
    const activePrescriptions = database.prepare(`SELECT count(*) AS count FROM prescriptions
      WHERE user_id = ? AND status = 'active'`).get(req.user.id).count;
    const unpaid = database.prepare(`SELECT COALESCE(sum(amount_cents), 0) AS total FROM invoices
      WHERE user_id = ? AND status = 'open'`).get(req.user.id).total;
    const unreadMessages = database.prepare('SELECT count(*) AS count FROM messages WHERE user_id = ? AND read = 0').get(req.user.id).count;
    const attentionLabs = database.prepare("SELECT count(*) AS count FROM labs WHERE user_id = ? AND status = 'attention'").get(req.user.id).count;
    res.json({
      nextAppointment: next ? appointmentView(next) : null,
      upcoming,
      stats: { activePrescriptions, amountDue: money(unpaid), unreadMessages, attentionLabs },
      welcomeNote: 'Small steps count. Your care plan is organized and ready when you are.'
    });
  });

  app.get('/api/appointments', (req, res) => {
    const rows = database.prepare('SELECT * FROM appointments WHERE user_id = ? ORDER BY appointment_at').all(req.user.id);
    res.json({ appointments: rows.map(appointmentView) });
  });

  app.post('/api/appointments', (req, res) => {
    const { clinicianName, specialty, location, appointmentAt, type = 'In person', reason } = req.body;
    if (![clinicianName, specialty, location, appointmentAt, reason].every((item) => typeof item === 'string' && item.trim())) {
      return res.status(400).json({ error: 'Please complete each appointment field.' });
    }
    if (Number.isNaN(Date.parse(appointmentAt))) return res.status(400).json({ error: 'Please choose a valid date and time.' });
    const result = database.prepare(`INSERT INTO appointments
      (user_id, clinician_name, specialty, location, appointment_at, type, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(req.user.id, clinicianName.trim(), specialty.trim(), location.trim(), appointmentAt, type, reason.trim());
    const appointment = database.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ appointment: appointmentView(appointment) });
  });

  app.post('/api/appointments/:id/cancel', (req, res) => {
    const result = database.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ? AND user_id = ? AND status = 'scheduled'")
      .run(req.params.id, req.user.id);
    if (!result.changes) return res.status(404).json({ error: 'This appointment is no longer available to cancel.' });
    res.json({ ok: true });
  });

  app.post('/api/appointments/:id/intake', (req, res) => {
    const { symptoms, duration, severity } = req.body;
    if (![symptoms, duration, severity].every((item) => typeof item === 'string' && item.trim())) {
      return res.status(400).json({ error: 'Please describe your concerns, duration, and severity.' });
    }
    const appointment = database.prepare('SELECT id FROM appointments WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });
    const summary = `${severity.trim()} concern for ${duration.trim()}: ${symptoms.trim()}`;
    database.prepare('INSERT INTO intake_notes (appointment_id, symptoms, duration, severity, summary) VALUES (?, ?, ?, ?, ?)')
      .run(appointment.id, symptoms.trim(), duration.trim(), severity.trim(), summary);
    res.status(201).json({ summary });
  });

  app.get('/api/prescriptions', (req, res) => {
    const prescriptions = database.prepare('SELECT * FROM prescriptions WHERE user_id = ? ORDER BY next_refill').all(req.user.id);
    res.json({ prescriptions: prescriptions.map((row) => ({
      id: row.id, medication: row.medication, instructions: row.instructions,
      refillsRemaining: row.refills_remaining, lastFilled: row.last_filled,
      nextRefill: row.next_refill, status: row.status
    })) });
  });

  app.post('/api/prescriptions/:id/refill', (req, res) => {
    const prescription = database.prepare('SELECT * FROM prescriptions WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!prescription || prescription.status !== 'active') return res.status(404).json({ error: 'Prescription not available.' });
    if (prescription.refills_remaining < 1) return res.status(400).json({ error: 'This prescription needs clinical renewal.' });
    const today = new Date().toISOString().slice(0, 10);
    database.prepare(`UPDATE prescriptions SET refills_remaining = refills_remaining - 1, last_filled = ?, next_refill = date(?, '+30 days')
      WHERE id = ?`).run(today, today, prescription.id);
    res.json({ message: 'Your refill request has been sent to the pharmacy.' });
  });

  app.get('/api/labs', (req, res) => {
    const labs = database.prepare('SELECT * FROM labs WHERE user_id = ? ORDER BY reported_at DESC').all(req.user.id);
    res.json({ labs: labs.map((row) => ({
      id: row.id, testName: row.test_name, value: row.value, unit: row.unit,
      range: row.range_text, status: row.status, reportedAt: row.reported_at, note: row.note
    })) });
  });

  app.get('/api/invoices', (req, res) => {
    const invoices = database.prepare('SELECT * FROM invoices WHERE user_id = ? ORDER BY due_at DESC').all(req.user.id);
    res.json({ invoices: invoices.map((row) => ({
      id: row.id, description: row.description, dueAt: row.due_at, amount: money(row.amount_cents), status: row.status, visitRef: row.visit_ref
    })) });
  });

  app.post('/api/invoices/:id/pay', (req, res) => {
    const result = database.prepare("UPDATE invoices SET status = 'paid' WHERE id = ? AND user_id = ? AND status = 'open'")
      .run(req.params.id, req.user.id);
    if (!result.changes) return res.status(404).json({ error: 'This invoice is already paid or unavailable.' });
    res.json({ message: 'Payment recorded. Your receipt is available in billing history.' });
  });

  app.get('/api/messages', (req, res) => {
    database.prepare('UPDATE messages SET read = 1 WHERE user_id = ?').run(req.user.id);
    const messages = database.prepare('SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json({ messages: messages.map((row) => ({ id: row.id, sender: row.sender, body: row.body, createdAt: row.created_at, read: Boolean(row.read) })) });
  });

  app.post('/api/messages', (req, res) => {
    const body = String(req.body.body || '').trim();
    if (!body || body.length > 1000) return res.status(400).json({ error: 'Messages must be between 1 and 1,000 characters.' });
    const result = database.prepare('INSERT INTO messages (user_id, sender, body, read) VALUES (?, ?, ?, 1)')
      .run(req.user.id, 'You', body);
    const message = database.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: { id: message.id, sender: message.sender, body: message.body, createdAt: message.created_at, read: true } });
  });

  app.post('/api/triage', (req, res) => {
    const concern = String(req.body.concern || '').trim().toLowerCase();
    if (!concern) return res.status(400).json({ error: 'Tell us what you would like help with.' });
    const urgentTerms = ['chest pain', 'trouble breathing', 'stroke', 'faint', 'unconscious', 'suicide'];
    if (urgentTerms.some((term) => concern.includes(term))) {
      return res.json({ urgency: 'emergency', department: 'Emergency services', message: 'This may need urgent attention. Call local emergency services now or go to the nearest emergency department. Do not wait for a portal response.' });
    }
    const specialty = concern.includes('skin') || concern.includes('rash') ? 'Dermatology'
      : concern.includes('heart') || concern.includes('blood pressure') ? 'Cardiology'
      : concern.includes('back') || concern.includes('joint') || concern.includes('shoulder') ? 'Physical therapy'
      : 'Family medicine';
    res.json({ urgency: 'routine', department: specialty, message: `A ${specialty} visit may be a good starting point. This guide cannot diagnose a condition; a clinician can help you decide what is right for you.` });
  });

  const clientDist = path.resolve(here, '../../client/dist');
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  return app;
}
