# Frontend Progress Report — Scam Squad

**Module:** 503IT — Communication and Collaboration
**Area:** Frontend (React client)
**Author:** Deverishi Gaire

This document tracks frontend progress for the Scam Squad project. Each entry
records what was completed, the decisions made, and the next steps.

---

## Phase 1 — Project Setup (2026-05-19)

### Summary

Set up the frontend foundation for the project: the React client application,
build tooling, routing, styling system, and the supporting project
documentation. No game screens were designed yet — the page components are
placeholder stubs awaiting the UI design file.

### Work completed

- Created the `dev` integration branch and the `feature/frontend-setup`
  feature branch following the agreed branch strategy.
- Scaffolded the React client in `/client` using Vite.
- Added and configured core libraries:
  - **React Router v6** for client-side routing.
  - **Tailwind CSS v3** for styling.
  - **Socket.io-client** for future real-time co-op gameplay.
- Registered the retro game fonts (VT323 and Press Start 2P) via Google Fonts.
- Created the client folder structure: `components`, `context`, `hooks`,
  `pages`, `services`, `assets`.
- Built the top-level route map (`App.jsx`) covering Home, Login, Register,
  Case Select, Case, Debrief, Leaderboard and a 404 fallback.
- Added service modules: `services/api.js` (REST helper) and
  `services/socket.js` (Socket.io client).
- Wrote project documentation: full `README.md`, `CONTRIBUTING.md` (git
  workflow), `SETUP.md` (setup guide), and `.env.example` templates for both
  the client and the server.

### Decisions

- **React 18 + Vite 5** were chosen over the newer React 19 + Vite 8 default
  so the project matches the README spec and runs on the current Node version
  without requiring a Node upgrade.
- **JavaScript (JSX)** was used rather than TypeScript to keep the codebase
  simple and consistent with the planned stack.
- Page components were left as **placeholder stubs** so the real UI can be
  built directly from the design file without rework.
- The `/server` directory was intentionally left untouched, as backend work
  is owned by the backend developer.

### Next steps

- Receive the UI design file.
- Build the shared layout and reusable components.
- Implement the Home and authentication screens.
- Integrate with the backend API once endpoints are available.

---

## Phase 2 — Authentication Screens (2026-05-19)

### Summary

Implemented the first two game screens from the UI design: the **Agent Login**
and **New Agent (registration)** pages, including the reusable retro-themed
component set they are built on.

### Work completed

- Extended the Tailwind theme with the Scam Squad colour palette (neon pink /
  cyan, deep-purple background, panel and field colours).
- Built reusable UI components:
  - `PixelButton` — neon action button and bordered "outline" button.
  - `TextField` — labelled, retro-styled text input.
  - `AuthScreen` — shared layout (gradient background, neon title, form card,
    "Back to Title" button) for the authentication pages.
- Built the **Login** page: username + password form, client-side validation,
  error messaging, and a link to registration.
- Built the **Register** page: username + password form with an 8-character
  minimum password rule, error messaging, and a link to login.
- Wired both forms to the backend through `services/api.js`
  (`POST /auth/login` and `POST /auth/register`); a successful response stores
  the auth token and routes the player to the case-select screen.
- Disabled the `react/prop-types` ESLint rule, as component props are
  documented with comments instead of PropTypes.

### Decisions

- Authentication uses **username + password** (matching the UI design) rather
  than the email-based flow mentioned earlier in the README.
- Login and registration share an `AuthScreen` layout to keep the retro look
  consistent and avoid duplicated markup.

### Next steps

- Set up the backend (`/server`) with the matching `/auth` endpoints.
- Build the title screen and the case-select screen.

---

## Phase 3 — Further Screens

_To be completed._
