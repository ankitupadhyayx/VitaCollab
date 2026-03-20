# VitaCollab Deployment Guide

## 1. Prerequisites
- Node.js 20+
- MongoDB 7+ (local or Atlas)
- Cloudinary account

## 2. Environment Setup
Create backend env file from the template:
- Copy backend/.env.example to backend/.env
- Set secure values for JWT and AES secrets
- Set Cloudinary credentials
- Optionally set DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD to auto-seed a startup admin

Create frontend env file from the template:
- Copy frontend/.env.local.example to frontend/.env.local
- Set NEXT_PUBLIC_API_URL (for local: http://localhost:5000/api/v1)

## 3. Local Production Build Validation
Backend:
- cd backend
- npm install
- npm run start

Frontend:
- cd frontend
- npm install
- npm run build
- npm run start

## 4. Docker Compose Deployment
From repository root:
- Ensure backend/.env exists
- Run: docker compose up --build -d

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1
- MongoDB: localhost:27017

## 5. Operational Hardening Checklist
- Disable default admin seeding in production unless needed.
- Rotate secrets regularly and keep env files out of source control.
- Restrict CORS in backend to trusted frontend domains.
- Use managed MongoDB backups and retention policy.
- Set up centralized log collection and alerting.

## 6. Admin Governance Notes
- Hospitals cannot upload records until admin verification is completed.
- Admin can review pending hospital accounts from the Admin Control Panel.
- Verification actions are written to audit logs.

## 7. Production Readiness Checklist
- Enable websocket gateway route in API runtime (`wss://<api-host>/ws`).
- Bind a monitoring provider (Sentry-compatible) to backend global hook (`global.__SENTRY__`).
- Keep refresh cookies `httpOnly` and `secure` in production.
- Rotate `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` on a regular schedule.
- Alert on repeated refresh-token mismatch events (possible token replay).
- Ensure camera permissions policy allows QR scanning for hospital/admin roles.
