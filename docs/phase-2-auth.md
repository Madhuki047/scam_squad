# Phase 2 — Auth + Email-based 2FA

This phase turns the bare auth scaffold from the previous commit into a
real sign-in flow. Email is optional at registration; supplying one turns
on two-factor verification for every future login.

## Sign-in flow

```
POST /api/auth/register   -> creates account, returns { token, user }
POST /api/auth/login      -> if no email on file:  returns { token, user }
                             if email on file:     emails a 6-digit OTP,
                                                   returns { otpRequired,
                                                             pendingToken,
                                                             emailHint }
POST /api/auth/verify-otp -> exchanges { pendingToken, code }
                             for the full { token, user }
```

The pending token (10-minute JWT, `pending: true`) only the `/verify-otp`
endpoint accepts. The `protect` middleware now explicitly rejects pending
tokens so they cannot be used to call protected APIs.

## What landed

- **`models/User.js`** — adds an optional, sparse-unique, lowercase `email`
  field and a `lastLogin` timestamp. The `pre('save')` hook still hashes the
  password only when it changes.
- **`controllers/authController.js`** — `register`, `login`, `verifyOtp`,
  `logout`. `createSessionToken` (7d) and `createPendingToken` (10m) are
  kept side by side so the difference is local and obvious. `maskEmail`
  produces the `a***t@mail.com` hint shown by the OTP screen.
- **`middleware/auth.js`** — same Bearer extraction as before, plus an
  early `401` for tokens with `pending: true`.
- **`routes/authRoutes.js`** — adds `POST /verify-otp`.
- **`services/otpStore.js`** — 5-minute, single-use OTP storage with
  basic brute-force protection (5 attempts then dropped). Uses Redis
  when `REDIS_URL` is set; falls back to an in-process `Map` so the flow
  remains testable locally.
- **`services/mailService.js`** — Nodemailer over Gmail SMTP. If
  `SMTP_USER`/`SMTP_PASS` are not configured, the OTP is logged to the
  server console instead — the 2FA flow is fully testable without a real
  mailbox.
- **`services/redisService.js`** — lazy ioredis client. The connection is
  *non-fatal*: a missing or unreachable Redis warns but does not stop the
  server (Mongo is the only hard requirement). Other services check
  `isRedisReady()` and fall back to memory.
- **`controllers/userController.js` + `routes/userRoutes.js`** — the
  signed-in player's own account: `GET /api/user/me`, `PATCH /api/user/me`
  (email change, password change with `currentPassword` check), and
  `DELETE /api/user/me`. Also `GET /api/user/:id` for public profile lookups.
  `safeUser()` strips the password hash before responding.
- **`index.js`** — wires the `/api/user` routes and calls `connectRedis()`
  after Mongo is connected.

## Environment

```env
# Required
MONGODB_URI=...
JWT_SECRET=...

# Optional (2FA + Redis fallback)
REDIS_URL=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

When `SMTP_*` is empty the OTP is printed to the server's stderr — handy
for development.

## Trying it locally

1. `POST /api/auth/register` with `{ username, password, email }` — you
   receive a session token immediately.
2. `POST /api/auth/logout` (any token) — server is stateless, the client
   just discards the token.
3. `POST /api/auth/login` with the same `username, password` — because
   the account now has an email on file, the server emails / logs an OTP
   and returns `{ otpRequired, pendingToken, emailHint }`.
4. `POST /api/auth/verify-otp` with `{ pendingToken, code }` — you receive
   the full session token.

The frontend's `Login` → `VerifyOtp` screens (shipped in Phase 1) drive
this flow end-to-end against the local backend.

## What this phase does NOT include

- Lives, quiz, activity feed — they ship in
  [`phase-3-gameplay.md`](./phase-3-gameplay.md).
- Server-side token revocation — JWT logout is client-only for now; a
  Redis denylist is a later hardening step.
