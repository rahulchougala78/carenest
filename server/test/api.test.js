import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createDatabase } from '../src/db.js';
import { createApp } from '../src/app.js';

process.env.JWT_SECRET = 'test-secret';

const database = createDatabase(':memory:');
const app = createApp(database);
let server;
let origin;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
});

test('demo user can sign in and read dashboard', async () => {
  const login = await fetch(`${origin}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'maya.rivera@example.com', password: 'Demo2026!' })
  });
  assert.equal(login.status, 200);
  const { token, user } = await login.json();
  assert.equal(user.firstName, 'Maya');
  const dashboard = await fetch(`${origin}/api/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(dashboard.status, 200);
  const body = await dashboard.json();
  assert.equal(body.nextAppointment.clinicianName, 'Dr. Elena Park');
  assert.equal(body.stats.activePrescriptions, 2);
});

test('an authenticated patient can create an appointment', async () => {
  const token = jwt.sign({ id: 1, email: 'maya.rivera@example.com' }, process.env.JWT_SECRET);
  const created = await fetch(`${origin}/api/appointments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ clinicianName: 'Dr. Minh Tran', specialty: 'Dermatology', location: 'Willow Clinic', appointmentAt: '2026-11-03T14:00:00', reason: 'Skin check' })
  });
  assert.equal(created.status, 201);
  const body = await created.json();
  assert.equal(body.appointment.specialty, 'Dermatology');
});
