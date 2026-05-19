# Scam Squad - Client

React + Vite frontend for **Scam Squad**, a story-driven co-op web game that
teaches cyber security to ages 10-18.

> For full project information, see the [root README](../README.md).

## Tech

- React 18 + Vite 5
- React Router v6
- Tailwind CSS v3
- Socket.io-client
- Fonts: VT323 + Press Start 2P (Google Fonts)

## Local development

```bash
cd client
npm install
cp .env.example .env   # then adjust values
npm run dev
```

The dev server runs on `http://localhost:5173`.

## Scripts

| Command           | Description                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Start the Vite dev server (HMR)      |
| `npm run build`   | Build for production into `dist/`    |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                           |

## Folder structure

```
client/
  public/            # static assets served as-is
  src/
    assets/          # images, icons imported by components
    components/      # reusable UI components
    context/         # React context providers (auth, game state)
    hooks/           # custom React hooks
    pages/           # route-level screens
    services/        # API + Socket.io clients
    App.jsx          # route map
    main.jsx         # app entry point
    index.css        # Tailwind entry + base styles
```

## Routes

| Path                       | Screen        |
|----------------------------|---------------|
| `/`                        | Home / landing |
| `/login`                   | Login (+ 2FA) |
| `/register`                | Register      |
| `/cases`                   | Case select   |
| `/cases/:caseId`           | Case gameplay |
| `/cases/:caseId/debrief`   | Case debrief  |
| `/leaderboard`             | Leaderboard   |

> Page components are currently placeholder stubs and will be implemented
> from the UI design file.
