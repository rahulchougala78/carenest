import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const defaultDatabasePath = path.resolve(here, '../data/carenest.sqlite');

const schema = `
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    phone TEXT NOT NULL,
    care_id TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    clinician_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    location TEXT NOT NULL,
    appointment_at TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    queue_number INTEGER,
    room TEXT,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    medication TEXT NOT NULL,
    instructions TEXT NOT NULL,
    refills_remaining INTEGER NOT NULL DEFAULT 0,
    last_filled TEXT,
    next_refill TEXT,
    status TEXT NOT NULL DEFAULT 'active'
  );
  CREATE TABLE IF NOT EXISTS labs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    test_name TEXT NOT NULL,
    value TEXT NOT NULL,
    unit TEXT,
    range_text TEXT,
    status TEXT NOT NULL,
    reported_at TEXT NOT NULL,
    note TEXT
  );
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    description TEXT NOT NULL,
    due_at TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    visit_ref TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    sender TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS intake_notes (
    id INTEGER PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id),
    symptoms TEXT NOT NULL,
    duration TEXT NOT NULL,
    severity TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

function seed(db) {
  if (db.prepare('SELECT count(*) AS count FROM users').get().count) return;
  db.exec('BEGIN');
  try {
    const passwordHash = bcrypt.hashSync('Demo2026!', 10);
    db.prepare(`INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth, phone, care_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run('maya.rivera@example.com', passwordHash, 'Maya', 'Rivera', '1988-04-16', '+1 (555) 014-8821', 'CN-2048-771');

    const appointment = db.prepare(`INSERT INTO appointments
      (user_id, clinician_name, specialty, location, appointment_at, type, status, queue_number, room, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    appointment.run(1, 'Dr. Elena Park', 'Family medicine', 'Willow Clinic · 2nd floor', '2026-10-02T09:40:00', 'In person', 'scheduled', 12, '204', 'Annual wellness follow-up');
    appointment.run(1, 'Jordan Ellis, PT', 'Physical therapy', 'Willow Clinic · Rehab wing', '2026-10-09T15:20:00', 'In person', 'scheduled', null, null, 'Shoulder mobility follow-up');
    appointment.run(1, 'Dr. Serena Patel', 'Cardiology', 'Video visit', '2026-10-22T11:00:00', 'Video', 'scheduled', null, null, 'Blood pressure review');

    const prescription = db.prepare(`INSERT INTO prescriptions
      (user_id, medication, instructions, refills_remaining, last_filled, next_refill, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`);
    prescription.run(1, 'Lisinopril 10 mg', 'Take 1 tablet by mouth each morning.', 2, '2026-09-05', '2026-10-04', 'active');
    prescription.run(1, 'Vitamin D3 1,000 IU', 'Take 1 capsule with food daily.', 3, '2026-08-18', '2026-11-16', 'active');

    const lab = db.prepare(`INSERT INTO labs
      (user_id, test_name, value, unit, range_text, status, reported_at, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    lab.run(1, 'Hemoglobin A1c', '5.4', '%', '4.0–5.6', 'normal', '2026-09-18T12:10:00', 'Within expected range.');
    lab.run(1, 'LDL cholesterol', '112', 'mg/dL', 'Below 130', 'attention', '2026-09-18T12:10:00', 'Review at your next visit.');
    lab.run(1, 'Vitamin D', '34', 'ng/mL', '30–100', 'normal', '2026-09-18T12:10:00', 'Within expected range.');

    const invoice = db.prepare(`INSERT INTO invoices
      (user_id, description, due_at, amount_cents, status, visit_ref) VALUES (?, ?, ?, ?, ?, ?)`);
    invoice.run(1, 'Office visit — 18 September', '2026-10-08', 3500, 'open', 'VIS-2026-0918');
    invoice.run(1, 'Lab services — 18 September', '2026-09-25', 1800, 'paid', 'LAB-2026-0918');

    const message = db.prepare('INSERT INTO messages (user_id, sender, body, created_at, read) VALUES (?, ?, ?, ?, ?)');
    message.run(1, 'Willow Clinic care team', 'Your September lab results are ready to review. One result is marked for discussion at your next visit.', '2026-09-19T14:30:00', 0);
    message.run(1, 'Dr. Elena Park', 'I look forward to seeing you next week. Please complete the brief visit check-in before you arrive.', '2026-09-24T09:10:00', 1);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function createDatabase(databasePath = defaultDatabasePath) {
  if (databasePath !== ':memory:') fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  database.exec(schema);
  seed(database);
  return database;
}

const configuredPath = process.env.DATABASE_PATH
  ? path.resolve(here, '..', process.env.DATABASE_PATH)
  : defaultDatabasePath;
export const db = createDatabase(configuredPath);
