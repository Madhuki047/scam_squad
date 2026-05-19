# Scam Squad - Server

Node.js + Express REST API for **Scam Squad**.

> For full project information, see the [root README](../README.md).

## Tech

- Node.js + Express
- MongoDB via Mongoose
- JWT authentication (`jsonwebtoken`)
- Password hashing with `bcryptjs`

## Local development

```bash
cd server
npm install
# create server/.env from the template in the project root:
#   cp ../.env.example .env
npm run dev
```

The server runs on `http://localhost:3001`.

## Environment variables

Set these in `server/.env` (see `.env.example` in the project root):

| Variable | Description |
|----------|-------------|
| `PORT` | Port the server listens on (default 3001) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `CLIENT_URL` | Frontend URL, allowed by CORS |

## Folder structure

```
server/
  config/        # database connection
  controllers/   # request handlers (business logic)
  middleware/    # auth guard, error handler
  models/        # Mongoose schemas
  routes/        # API route definitions
  index.js       # app entry point
```

## API endpoints

Base URL: `http://localhost:3001/api`

| Method | Path             | Description                  | Auth |
|--------|------------------|------------------------------|------|
| GET    | `/health`        | Health check                 | No   |
| POST   | `/auth/register` | Create a new player account  | No   |
| POST   | `/auth/login`    | Sign in an existing player   | No   |

### `POST /auth/register` and `POST /auth/login`

Request body:

```json
{ "username": "agent_nova", "password": "at least 8 chars" }
```

Successful response:

```json
{
  "token": "<jwt>",
  "user": { "id": "<id>", "username": "agent_nova" }
}
```

## Protecting future routes

Use the `protect` middleware (`middleware/auth.js`) on any route that needs a
logged-in player. It verifies the `Authorization: Bearer <token>` header and
attaches `req.userId`.
