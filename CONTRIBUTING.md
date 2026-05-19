# Contributing — Scam Squad

This guide describes how the Scam Squad team works together on the codebase.
Following it keeps the history clean and makes collaboration between the
frontend and backend smooth.

## Branch strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Never commit directly. |
| `dev` | Integration branch. All feature branches merge here first. |
| `feature/frontend-*` | A frontend feature (e.g. `feature/frontend-login`). |
| `feature/backend-*` | A backend feature (e.g. `feature/backend-auth`). |
| `fix/*` | A bug fix (e.g. `fix/leaderboard-sort`). |

**Rules**

- `main` and `dev` are protected — changes reach them only through pull requests.
- Always branch off `dev`, not `main`.
- Keep one branch focused on one feature or fix.

## Workflow

1. Make sure your local `dev` is up to date:
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. Create a branch for your work:
   ```bash
   git checkout -b feature/frontend-login
   ```
3. Commit in small, logical steps (see commit guidelines below).
4. Push your branch:
   ```bash
   git push -u origin feature/frontend-login
   ```
5. Open a pull request into `dev` on GitHub.
6. After review, merge the PR. Delete the branch once merged.
7. `dev` is merged into `main` only at stable milestones.

## Commit messages

Use short, descriptive messages in the form `type: summary`.

**Types**

| Type | Use for |
|------|---------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `style` | Formatting / CSS only, no logic change |
| `refactor` | Code change that is neither a feature nor a fix |
| `docs` | Documentation only |
| `chore` | Tooling, dependencies, config |

**Examples**

```
feat: add login form with 2FA step
fix: correct leaderboard score ordering
docs: update setup instructions
chore: add ESLint config
```

Guidelines:

- Write in the present tense ("add", not "added").
- Keep the summary under ~72 characters.
- One logical change per commit — avoid mixing unrelated work.

## Pull requests

A good PR:

- Targets the `dev` branch.
- Has a clear title and a short description of what changed and why.
- Is small enough to review easily.
- Does not include `.env` files, `node_modules/`, or build output.

## Code style

- Frontend: React function components, ESLint (`npm run lint` in `/client`).
- Keep components small and focused; reusable pieces go in `src/components`.
- Never commit secrets. Use `.env` files (ignored by git) and keep
  `.env.example` updated when you add a new variable.
