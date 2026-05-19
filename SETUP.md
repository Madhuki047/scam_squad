# Setup Guide — Scam Squad

Detailed instructions for running Scam Squad locally.

## 1. Prerequisites

Install the following before you start:

- **Node.js 18+** and npm — <https://nodejs.org>
- **Git** — <https://git-scm.com>
- A **MongoDB Atlas** account (free tier) — for the database
- An **Upstash Redis** account (free tier) — for sessions / rate limits
- A **Gmail** account with an *App Password* — for sending 2FA emails

Check your versions:

```bash
node -v
npm -v
git --version
```

## 2. Clone the repository

```bash
git clone https://github.com/Madhuki047/scam_squad.git
cd scam_squad
```

## 3. Environment variables

The project uses environment files that are **not** committed to git.
Templates are provided as `.env.example`.

- Root / server config: copy `.env.example` to `server/.env`.
- Client config: copy `client/.env.example` to `client/.env`.

```bash
cp .env.example server/.env
cp client/.env.example client/.env
```

Then fill in the values:

| Variable | Where to get it |
|----------|-----------------|
| `MONGODB_URI` | MongoDB Atlas → Connect → Drivers |
| `REDIS_URL` | Upstash → your database → REST/Redis URL |
| `JWT_SECRET` | Any long random string |
| `GMAIL_USER` | Your Gmail address |
| `GMAIL_APP_PASSWORD` | Google Account → Security → App Passwords |

## 4. Run the backend

```bash
cd server
npm install
npm run dev
```

The backend runs on <http://localhost:3001>.

## 5. Run the frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

The frontend runs on <http://localhost:5173>.

## 6. Verify

Open <http://localhost:5173> in a browser. The app should load without
console errors and be able to reach the backend API.

## Troubleshooting

- **Port already in use** — stop the other process or change the port in the
  relevant `.env` file.
- **`npm install` fails** — delete `node_modules` and `package-lock.json`,
  then run `npm install` again.
- **Frontend cannot reach the API** — confirm the backend is running and that
  `VITE_API_URL` in `client/.env` points to it.
- **Node engine warnings** — make sure you are on Node 18+ (Node 20 LTS
  recommended).
