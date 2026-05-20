# Phase 3 — Lives, Adaptive Quiz, Activity Feed

This phase introduces the game systems players actually interact with
outside the case files: a finite-lives economy, a short adaptive MCQ that
can earn lives back, and an activity feed that powers the Profile screen.

## New endpoints

```
GET    /api/lives            current lives + next regen timestamp
POST   /api/lives/use        spend one life (called when a case fails)

GET    /api/quiz/next        get the next question for the active session
POST   /api/quiz/answer      submit answer; updates adaptive difficulty
POST   /api/quiz/complete    finalise the 5-question session, award bonus

GET    /api/activity         signed-in player's recent activity feed
```

All routes are gated by `protect` (Bearer JWT).

## Lives system

- Cap: **5 lives**. Regen: **+1 every 30 minutes**.
- The authoritative clock lives on `user.lastLifeRegen` in Mongo, not in
  Redis, so a single server instance is self-sufficient and dev works
  without an Upstash instance. `services/livesService.js` exposes pure
  helpers (`applyRegen`, `getNextRegenAt`, `useLife`, `grantLife`) that
  mutate a `User` doc in memory; controllers decide when to `.save()`.
- `GET /api/user/me` *also* settles any pending regen on read, so every
  screen that loads the user sees up-to-date lives without polling.
- Each whole 30-minute tick since `lastLifeRegen` adds one life; the
  clock is then advanced by exactly `appliedTicks * interval`, so partial
  ticks are not thrown away (a player who returns 31 minutes later still
  has 1 minute banked).

## Adaptive 5-question quiz

- Session state lives behind one key per user in
  `services/quizSessionStore.js` (Redis when available, in-memory `Map`
  fallback). TTL 15 min, read-modify-write.
- Difficulty starts on **easy** and tracks a streak: two correct in a row
  steps up to medium, then hard; two wrong in a row steps back down. The
  streak resets after a level change.
- Questions are sampled with `$sample` from `QuizQuestion` documents
  matching the current level, excluding everything already shown this
  session, so a player never sees the same question twice.
- On `/answer`, the backend returns `{ correct, correctIndex, nextLevel,
  progress, finished }`. The correct index is never sent to the client
  before the answer is submitted.
- On `/complete`, scoring **4/5** or better grants one life
  (`grantLife()`), capped at 5. The completion is appended to the
  activity log.

## Question pool

`server/scripts/seedQuizQuestions.js` seeds **45 questions** — 5 categories
(phishing, cyberbullying, social engineering, public Wi-Fi, AI manipulation)
× 3 difficulties (easy, medium, hard) × 3 questions each. Run with:

```bash
cd server
npm run seed
```

The seed script replaces the entire collection, so it is safe to re-run.

## Activity feed

- `models/ActivityLog.js` — append-only `{ type, message, points }`
  documents keyed by `userId`.
- `services/activityService.js` writes are best-effort: a logging failure
  is caught and warned so the parent request never breaks.
- `GET /api/activity?limit=20` returns the player's recent items
  (`limit` clamped to `[1, 50]`).
- Currently written by: quiz completion and life loss. Case completion,
  badges, and shop purchases will plug into the same `logActivity()`
  helper as their phases land.

## Schema additions

`User` now carries the gameplay state: `points`, `livesRemaining`,
`lastLifeRegen`, `totalScore`, `casesSolved`, `accuracy`, `dayStreak`,
`rank`, `level`, `xp`, `badges`, `inventory`, `friends`,
`pendingRequests`, and `settings.notifications`. Every new field has a
default so the existing `User.create({ username, password })` call
in the auth controller is unchanged.

## What this phase does NOT include

- **Anti-cheat rate limits.** The risky endpoints have `// Phase 6`
  markers — `POST /api/lives/use` should cap at 3/min/user and
  `POST /api/quiz/answer` at 1 every 2 seconds.
- **Leaderboard, friends, chat.** Social phase (Phase 4) — uses
  Socket.io for chat.
- **Shop.** Power-up shop is Phase 5.

The `inventory` and `friends`/`pendingRequests` fields land on the User
schema in this phase so the later phases can start writing to them
without a migration.
