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

---

## Leaderboard, Shop and Squad APIs (2026-05-21)

### Summary

Wired up the three remaining game screens (Rankings, Power-up Shop, Squad)
to real endpoints, and made the adaptive quiz recoverable when a session is
abandoned mid-question. All build on the existing `User` model fields
(`xp`, `points`, `inventory`, `friends`, `pendingRequests`) — no schema
changes were needed.

### Endpoints added

- **Leaderboard** (`controllers/leaderboardController.js`,
  `routes/leaderboardRoutes.js`, mounted at `/api/leaderboard`):
  - `GET /api/leaderboard` — top 20 players ranked by **lifetime `xp`**, plus
    the caller's own rank. `xp` (not `points`) is the ranking key because
    `points` is spendable currency in the shop and would make a player's rank
    drop when they buy something.
- **Shop** (`controllers/shopController.js`, `routes/shopRoutes.js`, mounted
  at `/api/shop`):
  - `GET /api/shop` — server-owned catalog (`SHOP_CATALOG`, mirroring
    `CASE_CATALOG`) plus the player's balance and inventory.
  - `POST /api/shop/buy/:itemId` — validates funds and prior ownership
    server-side, deducts `points`, grants the item (consumable counter or
    cosmetic boolean), logs a `shop` activity entry.
- **Squad** (`controllers/friendsController.js`, `routes/friendsRoutes.js`,
  mounted at `/api/friends`):
  - `GET /api/friends`, `GET /api/friends/search?q=`,
    `POST /api/friends/request|accept|decline|remove/:id`.
  - `pendingRequests` holds **incoming** requests. Sending a request to
    someone who already requested you confirms the friendship instead.
- **Quiz** (`controllers/quizController.js`):
  - `POST /api/quiz/reset` — clears the per-user quiz session so the client
    can recover from a question left in progress (the previous behaviour
    dead-ended `GET /api/quiz/next` with "a question is already in progress").

### Decisions

- Item prices live only on the server and are returned by `GET /api/shop`,
  so the client can't tamper with them and tuning is a one-file edit.
- The squad surface is intentionally minimal: search, request, accept/decline,
  list, remove. No DMs, presence, or notifications.
