# Phase 6 — Polish + Deploy

Closing phase: anti-cheat rate limits on the risky endpoints, hardened
response headers, and the deploy notes the team will follow for the
academic submission.

## Rate limits

A per-user, in-process limiter (`server/middleware/rateLimit.js`) gates
the two endpoints flagged in earlier phases:

| Endpoint | Limit | Reason |
|----------|-------|--------|
| `POST /api/lives/use` | 3 / minute / user | A real player loses at most a handful of lives a minute. Anything faster is a script trying to drain or churn the cooldown. |
| `POST /api/quiz/answer` | 1 / 2 seconds / user | One answer every 2s is faster than a human can read a question. Anything faster is a bot brute-forcing the MCQ. |

Design:

- Buckets are keyed by `userId|routeId`, so the limit applies after
  `protect` and pre-auth abuse falls to the JWT itself (no token, no
  route, no quota consumed).
- The limiter sweeps stale buckets every 60s so memory can't grow
  unbounded under churn.
- On exceed: HTTP **429** with `{ message, retryAfterSeconds }` and a
  `Retry-After` header (rounded up).
- In-process only. A single Railway instance is enough for the
  documented thresholds; moving to multi-instance is a Redis-backed
  swap of the same interface.

## Security headers

`server/middleware/securityHeaders.js` registers a minimal headers
middleware globally:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Permissions-Policy: camera=(), geolocation=(), microphone=()`

This is intentionally lighter than pulling in `helmet`: the backend is
JSON-only, so the surface area is small and the dependency cost was not
worth it.

## Deploy

### Backend → Railway

1. Create a new Railway project from the GitHub repo, root **`/server`**.
2. Build: `npm install` (no build step — pure Node).
3. Start: `npm start`.
4. Set env vars (see `.env.example` at the repo root):
   - `MONGODB_URI` (required)
   - `JWT_SECRET` (required, long random string)
   - `CLIENT_URL=https://<vercel-app>.vercel.app` (for CORS)
   - `REDIS_URL` (optional — enables OTP / quiz-session persistence)
   - `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` (optional — enables real
     OTP email; otherwise codes are logged to the server console)
5. Railway terminates TLS upstream, so `HSTS` and `wss://` work without
   extra config.

### Frontend → Vercel

1. Create a new Vercel project from the GitHub repo, root **`/client`**.
2. Framework: Vite. Build: `npm run build`. Output: `dist`.
3. Env vars:
   - `VITE_API_URL=https://<railway-app>.up.railway.app/api`
   - `VITE_SOCKET_URL=https://<railway-app>.up.railway.app` *(optional;
     derives from `VITE_API_URL` minus `/api` if unset)*

### Quick checks after deploy

1. `GET https://<railway>/api/health` → `{ "status": "ok" }`.
2. Register an agent without an email, sign in, hit `/api/user/me` from
   the browser console.
3. Add an email via `PATCH /api/user/me`, sign out, sign in again, and
   verify the OTP arrives (either in the inbox or in the Railway logs
   if SMTP isn't configured).
4. Open two browsers, friend each other, open both Squad → Chat panels,
   send a message — it should appear in the other tab live.

## What this phase does NOT include

- **Cross-instance rate limiting.** A single Railway instance is enough
  for the documented limits. Add a Redis-backed adapter behind the same
  `rateLimit({ id, windowMs, max })` interface when scaling out.
- **Full content-security policy.** No HTML is served from the API, so
  it would be no-op.
- **Observability.** Logging to stdout is enough for Railway; metrics +
  tracing are post-academic-deadline concerns.

This is the final planned phase.
