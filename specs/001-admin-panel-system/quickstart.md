# Quickstart: Admin Panel System

This quickstart describes the intended local development workflow for the planned architecture (backend + frontend + PostgreSQL, all Dockerized).

## Prerequisites

- Docker + Docker Compose

## Environment

Backend (recommended env vars)
- `NODE_ENV=development`
- `PORT=4000`
- `DATABASE_URL=postgres://postgres:postgres@db:5432/painel_admin`
- `JWT_ACCESS_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `FILES_BASE_PATH=/data/files` (mounted volume)

Frontend
- `VITE_API_BASE_URL=http://localhost:4000/api`

## Architecture & Services

The system consists of:
- **db**: PostgreSQL 15.
- **backend**: Node.js 20 + Express. Handles API, Auth, Files, DOCX/PDF generation (LibreOffice installed).
- **frontend**: Vue 3 + Vuetify. Served via Vite.

## Run locally (Docker Compose)

1) Start everything:
- `docker compose up --build`

2) Open the apps:
- Frontend: `http://localhost:3000`
- Backend health (example): `http://localhost:4000/api/health`

3) Run migrations:
- `docker compose exec backend npm run db:migrate`

4) (Optional) Seed initial data:
- Use the endpoints or add a seed script. Default user/group flow:
  - Register/Login manually.
  - Or manually insert via psql.

## Run tests

Backend
- Unit + integration: `docker compose exec backend npm test`

Frontend
- Unit: `docker compose exec frontend npm test`
- E2E (Cypress): `cd frontend && npm run cypress:open` (requires dependencies on host)


## Notes on group scoping

- Group-owned resources are accessed under `/api/groups/:groupId/...`.
- Attorneys can only access groups where they have membership; administrators can access all groups.
- Evaluators are denied access to the panel and denial attempts are audited.

