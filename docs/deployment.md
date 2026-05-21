# Deployment — Scam Squad

The app deploys as two pieces from this one repo:

- **Frontend** (`client/`) → **Vercel** (static Vite build).
- **Backend** (`server/`) → **Render** (free web service, long-running Express).

They are different origins, so the backend allows the frontend through CORS
(`CLIENT_URL`) and the frontend points at the backend via `VITE_API_URL`.

Deploy the **backend first** — you need its public URL to configure the
frontend.

> The repo is **public**, so Render can deploy it by URL with no GitHub App /
> repo-access setup. (Railway also works but now requires a paid plan.)

---

## 0. Push the code

Render reads the repo from GitHub, so the branch you want live must be on
`origin` (https://github.com/Madhuki047/scam_squad). Either deploy the
`feature/cases-storyline` branch directly, or merge it into `main` first.

---

## 1. Backend → Render

1. At <https://render.com> → **New → Web Service**.
2. Choose **"Public Git Repository"** and paste:
   `https://github.com/Madhuki047/scam_squad` → **Continue**.
   (This path skips connecting the GitHub App entirely.)
3. Configure the service:

   | Field | Value |
   |-------|-------|
   | Name | `scam-squad-api` (anything) |
   | Branch | `feature/cases-storyline` (or `main` if merged) |
   | Root Directory | `server` |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | **Free** |

   Render sets `PORT` automatically; the server already reads
   `process.env.PORT`, so no change is needed.

4. **Environment Variables** — add:

   | Variable | Value | Required |
   |----------|-------|----------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string | **Yes** |
   | `JWT_SECRET` | A long random string | **Yes** |
   | `CLIENT_URL` | Your Vercel URL (set in step 2 — placeholder for now) | **Yes** for CORS |
   | `REDIS_URL` | Upstash `rediss://…` URL | Optional* |
   | `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Gmail App Password creds | Optional (2FA email) |

   *On Render the server is a single long-running instance, so the in-memory
   fallback for quiz sessions / OTP works without Redis. Add `REDIS_URL` only
   if you want those to survive restarts.

5. **Create Web Service.** Render builds and gives a URL like
   `https://scam-squad-api.onrender.com`.
6. Verify: open `https://<your-render-url>/api/health` — it should return
   `{"status":"ok"}`. (First hit after idle can take ~30-60s while the free
   instance wakes.)

> **MongoDB Atlas network access:** Render's free egress IPs are dynamic, so
> in Atlas → Network Access add `0.0.0.0/0` (allow from anywhere). Otherwise
> the server can't reach the database and the deploy crash-loops.

> **The server exits if `MONGODB_URI` is missing or wrong** (`process.exit(1)`),
> which shows up as a failed deploy / restart loop. Fix the variable and it
> redeploys healthy.

> **Quiz questions:** the quiz needs seeded `QuizQuestion` documents. If Render
> uses the **same** Atlas database you developed against, they're already
> there. If it's a fresh database, seed it once locally against the prod URI:
> `cd server && MONGODB_URI="<prod-uri>" npm run seed`.

---

## 2. Frontend → Vercel

1. At <https://vercel.com> → **Add New → Project** → import this repo.
   (Public repo, so the import works without extra GitHub App access.)
2. **Root Directory** = `client`. Vercel auto-detects the **Vite** preset
   (build `npm run build`, output `dist`). `client/vercel.json` adds the SPA
   fallback so deep links like `/play` and `/shop` don't 404 on refresh.
3. **Environment Variables** — add:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://<your-render-url>/api` |

   (Vite inlines this at **build time**, so it must be set before deploy.
   Changing it later requires a redeploy.)
4. **Deploy**, then note your Vercel URL, e.g.
   `https://scam-squad.vercel.app`.

---

## 3. Close the CORS loop

Go back to **Render → your service → Environment**, set `CLIENT_URL` to your
real Vercel URL (no trailing slash), and save (Render redeploys). The backend
only allows that one origin, so until it matches, the browser blocks API calls
with a CORS error.

> Vercel **preview** deployments get unique URLs that won't match `CLIENT_URL`
> and will be CORS-blocked. That's expected — the production domain is what's
> configured. (To support previews, the CORS `origin` in `server/index.js`
> would need to accept a list / pattern.)

---

## Quick checklist

- [ ] Code pushed to GitHub
- [ ] Render: public repo URL, root dir `server`, env vars set, Free instance
- [ ] Atlas Network Access allows `0.0.0.0/0`
- [ ] `/api/health` returns ok
- [ ] Vercel: root dir `client`, `VITE_API_URL` set to Render `/api`
- [ ] Render `CLIENT_URL` set to the Vercel URL (CORS)
- [ ] Log in on the live site and solve a case end-to-end

---

## Note on the free tier

Render's free web services **spin down after ~15 minutes of inactivity**; the
next request wakes them (~30-60s cold start). Fine for a demo. To avoid sleep,
upgrade the Render instance or move the backend to a paid host (e.g. Railway
Hobby, ~$5/mo).

---

## Alternative: avoid CORS with a Vercel proxy

If cross-origin CORS is fiddly, you can instead proxy `/api` from Vercel to
Render and keep the browser same-origin. Replace `client/vercel.json` with:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://<your-render-url>/api/:path*"
    },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

…and set `VITE_API_URL=/api`. No `CLIENT_URL`/CORS tuning needed, at the cost
of an extra Vercel→Render hop per request.
