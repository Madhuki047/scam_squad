# Backend Setup Report — Scam Squad

**Module:** 503IT — Communication and Collaboration
**Area:** Backend (Express API) — initial setup

This document records the initial setup of the backend so the rest of the
backend work (game logic, scores, Socket.io co-op, etc.) can build on it.

---

## Initial Backend Setup (2026-05-19)

### Summary

Created the `/server` Express application and a working username/password
authentication API, so the Login and Register screens have endpoints to call.

### Work completed

- Created the Express application in `/server` with an organised structure:
  `config/`, `controllers/`, `middleware/`, `models/`, `routes/`.
- Added the database connection (`config/db.js`) using Mongoose; the server
  refuses to start without a valid `MONGODB_URI`.
- Added the `User` Mongoose model — username + password, with the password
  hashed automatically via a `bcryptjs` pre-save hook.
- Built the authentication controller and routes:
  - `POST /api/auth/register` — create an account, returns a JWT.
  - `POST /api/auth/login` — sign in, returns a JWT.
- Added a JWT route-guard middleware (`middleware/auth.js`) for protecting
  future endpoints, and a central error handler.
- Added a `GET /api/health` health-check endpoint.
- Configured CORS so the Vite frontend can call the API.
- Documented the API and folder structure in `server/README.md`.

### Decisions

- Authentication uses **username + password** with **JWT** sessions, matching
  the game's UI design.
- `bcryptjs` was used instead of the native `bcrypt` package so the project
  installs without a build toolchain (important on Windows).
- The backend uses ES modules, consistent with the frontend.

### How to run

1. Create `server/.env` from the project-root `.env.example` and set a real
   `MONGODB_URI` and `JWT_SECRET`.
2. `cd server && npm install && npm run dev`.
3. The API is available at `http://localhost:3001/api`.

### Next steps (for the backend developer)

- Game models: scores, badges, case progress, quiz questions.
- Socket.io setup for real-time co-op gameplay.
- Redis for sessions, rate limiting and life cooldowns.
