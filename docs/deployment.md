# Deployment — Scam Squad

The app deploys as two pieces from this one repo:

- **Frontend** (`client/`) → **Vercel** (static Vite build).
- **Backend** (`server/`) → **Railway** (long-running Express server).

They are different origins, so the backend allows the frontend through CORS
(`CLIENT_URL`) and the frontend points at the backend via `VITE_API_URL`.

Deploy the **backend first** — you need its public URL to configure the
frontend.

---

## 0. Push the code

Vercel and Railway both deploy from GitHub, so the branch you want live must
be pushed to `origin` (https://github.com/Madhuki047/scam_squad). Merge the
feature branch into `main` (or point both platforms at the branch).

---

## 1. Backend → Railway

1. Create a project at <https://railway.app> → **New Project → Deploy from
   GitHub repo** → pick this repo.
2. Open the service → **Settings → Root Directory** = `server`.
   (Railway then reads `server/railway.json` and runs `npm install` +
   `npm start`. Railway provides `PORT` automatically; the server already
   reads `process.env.PORT`.)
3. **Settings → Variables** — add:

   | Variable | Value | Required |
   |----------|-------|----------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string | **Yes** |
   | `JWT_SECRET` | A long random string | **Yes** |
   | `CLIENT_URL` | Your Vercel URL (set in step 3 — use a placeholder for now) | **Yes** for CORS |
   | `REDIS_URL` | Upstash `rediss://…` URL | Optional* |
   | `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Gmail App Password creds | Optional (2FA email) |

   *On Railway the server is a single long-running instance, so the
   in-memory fallback for quiz sessions / OTP works without Redis. Add
   `REDIS_URL` only if you want sessions to survive restarts or scale to
   multiple instances.

4. **Settings → Networking → Generate Domain** to get a public URL, e.g.
   `https://scam-squad-production.up.railway.app`.
5. Verify it's up: open `https://<your-railway-domain>/api/health` — it
   should return `{"status":"ok"}`.

> **MongoDB Atlas network access:** allow Railway to connect. In Atlas →
> Network Access, add `0.0.0.0/0` (allow from anywhere) or Railway's egress
> IPs. Otherwise the server can't reach the database.

> **Quiz questions:** the quiz needs seeded `QuizQuestion` documents. If
> Railway uses the **same** Atlas database you developed against, they're
> already there. If it's a fresh database, seed it once:
> `cd server && MONGODB_URI="<prod-uri>" npm run seed`.

---

## 2. Frontend → Vercel

1. Create a project at <https://vercel.com> → **Add New → Project** → import
   this repo.
2. **Root Directory** = `client`. Vercel auto-detects the **Vite** preset
   (build `npm run build`, output `dist`). `client/vercel.json` adds the SPA
   fallback so deep links like `/play` and `/shop` don't 404 on refresh.
3. **Environment Variables** — add:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://<your-railway-domain>/api` |

   (Vite inlines this at **build time**, so it must be set before/at deploy.
   Changing it later requires a redeploy.)
4. **Deploy**, then note your Vercel URL, e.g.
   `https://scam-squad.vercel.app`.

---

## 3. Close the CORS loop

Go back to **Railway → Variables**, set `CLIENT_URL` to your real Vercel URL
(no trailing slash), and let it redeploy. The backend only allows that one
origin, so until this matches, the browser will block API calls with a CORS
error.

> Vercel **preview** deployments get unique URLs that won't match
> `CLIENT_URL` and will be CORS-blocked. That's expected — the production
> domain is what's configured. (To support previews, the CORS `origin` in
> `server/index.js` would need to accept a list / pattern.)

---

## Quick checklist

- [ ] Code pushed to GitHub
- [ ] Railway: root dir `server`, env vars set, domain generated
- [ ] Atlas Network Access allows Railway
- [ ] `/api/health` returns ok
- [ ] Vercel: root dir `client`, `VITE_API_URL` set to Railway `/api`
- [ ] Railway `CLIENT_URL` set to the Vercel URL (CORS)
- [ ] Log in on the live site and solve a case end-to-end

---

## Alternative: avoid CORS with a Vercel proxy

If cross-origin CORS is fiddly, you can instead proxy `/api` from Vercel to
Railway and keep the browser same-origin. Replace `client/vercel.json` with:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://<your-railway-domain>/api/:path*"
    },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

…and set `VITE_API_URL=/api`. No `CLIENT_URL`/CORS tuning needed, at the cost
of an extra Vercel→Railway hop per request.
