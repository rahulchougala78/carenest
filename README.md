# CareNest Portal

CareNest is an original, full-stack patient-portal demonstration. It covers the practical patient journey: booking and managing appointments, viewing a live visit queue, completing pre-visit intake, managing prescriptions and refills, reviewing lab results, paying invoices, and messaging a care team.

It is inspired only by the *category* of patient portals. It does not use ASUS names, visual assets, source code, data, or a copied interface.

## Stack

- React + Vite single-page frontend
- Express REST API
- SQLite database using Node's built-in driver, with automatic schema creation and demo seed data
- JWT-backed demo login
- Docker and Render deployment configuration

## Run locally

CareNest requires Node.js 24 or newer because its API uses the built-in SQLite driver.

1. Install dependencies: `npm install && npm install --prefix client && npm install --prefix server`
2. Copy `.env.example` to `server/.env` and set a strong `JWT_SECRET`.
3. Run `npm run dev`.
4. Open `http://localhost:5173`.

Use `maya.rivera@example.com` with password `Demo2026!` for the demo account.

## Test and production build

```sh
npm test
npm run build
npm start
```

When `client/dist` exists, the Express server serves the built web app and API from one origin at `http://localhost:8080`.

## Deploy

### Docker

```sh
docker build -t carenest-portal .
docker run -p 8080:8080 -e JWT_SECRET='use-a-long-random-secret' -v carenest-data:/app/server/data carenest-portal
```

The mounted volume is essential: it preserves the SQLite database between restarts. For a real clinical deployment, replace SQLite with a managed encrypted database, put the service behind TLS, and complete the required security/compliance review.

### Render

This repository includes `render.yaml`. Connect the Git repository in Render, create the Blueprint, add a strong `JWT_SECRET`, and attach a persistent disk mounted at `/app/server/data`. Render will build and start the service from the included configuration.

## Safety note

This is a design and engineering demonstration only, not a clinical system. The symptom guide is deliberately non-diagnostic; emergency symptoms must be directed to local emergency services.
