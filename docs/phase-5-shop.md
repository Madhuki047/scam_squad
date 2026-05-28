# Phase 5 — Power-up Shop

Players spend points earned from quizzes and cases on consumables and
cosmetics. The catalog is small and curated, so it's defined in code
(`server/controllers/shopController.js`) rather than as DB rows — any
change is a code change that goes through review.

## Endpoints

```
GET  /api/shop                 catalog + signed-in player's
                                points balance + inventory
POST /api/shop/buy/:itemId     spend points, update inventory,
                                log activity
```

Both routes require a Bearer JWT.

`buyItem` enforces three checks:

- Unknown `itemId` → 404.
- Cosmetic already owned → 409 (consumables can always be re-bought to
  stack the count).
- Not enough points → 402.

On success the response carries the new `points` and `inventory` so the
client can update without a second fetch.

## Catalog

| Item | Kind | Price | Effect |
|------|------|-------|--------|
| Magnifier | consumable | 100 | Remove one wrong answer on a quiz question |
| Extra Time | consumable | 80 | Add 30 seconds to a timed case |
| Second Chance | consumable | 150 | Replay one failed case attempt |
| Hint Token | consumable | 60 | Reveal a hint on the current case |
| Neon Skin | cosmetic | 1000 | Avatar skin |
| Founder Badge | cosmetic | 800 | Profile badge |
| Director Title | cosmetic | 1200 | "Director" title next to your name |

Consumable ids match the existing inventory fields on `User`
(`magnifier`, `time`, `second`, `hint`); cosmetics flip the matching
`*Owned` boolean.

## Client

`client/src/pages/Shop.jsx` replaces the `/shop` ComingSoon placeholder
with two grids (consumables, cosmetics) inside the same card layout
used elsewhere in the app. The header shows the player's current
balance. After every successful buy:

- Local state is patched from the response so the grid re-renders
  instantly.
- `refreshUser()` is called so the global user record (e.g. anything
  the TopNav reads) is kept in sync.

## Activity feed

Every purchase appends a `shop` activity entry with `points = -price`,
so the Profile screen's Recent Activity panel shows spending alongside
quiz wins and life losses.

## What this phase does NOT include

- **Earning the consumable effects.** Spending a Magnifier, Hint Token,
  etc. is the case team's job — those calls plug into the existing
  inventory counters from this phase.
- **Time-limited offers or seasonal items.** The catalog is static.
- **Refunds.** Once you buy, the points are gone.

Phase 6 follows: rate-limit hardening on `/lives/use` and `/quiz/answer`,
security headers, and deploy notes.
