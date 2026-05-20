# Phase 1 — Foundation

This phase lands the monorepo and the full frontend shell that every later
phase plugs into. It is intentionally heavier on plumbing than on features:
once the layout, routing, contexts, and API client are in place, subsequent
phases can focus purely on game systems.

## What landed

- **Monorepo layout.** Two apps under one repo: `client/` (React + Vite +
  Tailwind) and `server/` (the Express API delivered separately under
  `feat: scaffold Express backend with authentication API`). Shared docs
  live under `docs/`. A single root `.env.example` documents the backend
  environment.
- **Vite + React 18 + Tailwind frontend.** `client/index.html`, `vite.config.js`,
  `postcss.config.js`, `tailwind.config.js`, and the Tailwind theme inside
  `client/src/index.css` give the app the dark/neon "cyber" look used by
  every screen.
- **Routing.** `BrowserRouter` in `client/src/main.jsx` and the route table
  in `client/src/App.jsx`. Public routes are `/`, `/login`, `/register`,
  and `/verify-otp`; signed-in routes live behind `<ProtectedRoute>` and
  render inside `<AppLayout>`.
- **In-app shell.** `AppLayout`, `Sidebar`, and `TopNav` form the persistent
  frame for signed-in screens. The Sidebar drives navigation; the TopNav
  shows the current page title (and later the live life-regen countdown).
  `getPageTitle()` in `client/src/lib/nav.js` is the single source of
  truth for what each path is called.
- **Contexts.**
  - `AuthContext` (`client/src/context/AuthContext.jsx`) — the signed-in
    player; only the JWT is persisted (`localStorage`), the full record is
    always re-fetched from `GET /api/user/me` on load so a refresh
    re-verifies the token.
  - `SettingsContext` (`client/src/context/SettingsContext.jsx`) — device
    -local audio + accessibility preferences. Persisted in `localStorage`;
    accessibility flags are reflected as classes on `<html>` so CSS can
    react app-wide.
- **API client.** `client/src/lib/api.js` centralises every backend call,
  reads the base URL from `VITE_API_URL`, attaches the bearer token, and
  throws an `Error` carrying the backend's `message` on any non-2xx.
- **First screens.** Title (entry / "PRESS START"), Login, Register,
  VerifyOtp, Home, Profile, Settings, and a generic `ComingSoon` placeholder
  used for routes whose features land in later phases (Leaderboard,
  Squad, Shop).
- **Banner.** README now leads with `docs/images/banner.png` and the
  Project Phases table linking to this doc and the two phase docs that
  follow.

## Run it

```bash
# from the repo root
cp .env.example server/.env
cd server && npm install && npm run dev      # http://localhost:3001

# in a second terminal
cd client && npm install
cp .env.example .env                          # defaults are fine for dev
npm run dev                                   # http://localhost:5173
```

## What this phase does NOT include

- Server-side 2FA — the email/OTP flow ships in Phase 2.
- Lives, quiz, and activity systems — Phase 3.
- Leaderboard, Squad, Shop — placeholders only, built in later phases.

See [`phase-2-auth.md`](./phase-2-auth.md) and
[`phase-3-gameplay.md`](./phase-3-gameplay.md) for what comes next.
