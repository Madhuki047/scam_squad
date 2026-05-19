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

## Phase 2 — UI Implementation

_To be completed._
