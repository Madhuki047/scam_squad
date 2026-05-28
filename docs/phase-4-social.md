# Phase 4 — Social (Leaderboard, Squad, Realtime Chat)

The cooperative half of the game. This phase adds a global leaderboard,
friend requests, and a 1:1 chat that uses the existing JWT for auth.

## What landed

### Leaderboard

```
GET /api/leaderboard?limit=20&offset=0   paginated, sorted by totalScore
GET /api/leaderboard/me                  current player's true rank
```

- Ranking ties are broken by earliest `createdAt`, so the order is stable
  even when scores are equal.
- `rank` is computed live from the offset — the cached `user.rank` field
  is not relied on, so the result is always correct.
- The Leaderboard screen highlights the signed-in row inline. When the
  player isn't on the visible page, a small "Your position: #N" panel
  shows the true rank from `GET /api/leaderboard/me`.

### Friend system

Mounted at `/api/friends`. `User.friends` and `User.pendingRequests`
(both already on the schema from Phase 3) carry the data; this phase
adds the controllers.

```
GET    /                list friends (populated, public fields only)
GET    /requests        incoming pending requests
GET    /search?q=...    prefix search; excludes self, current friends,
                         and anyone already pending so every match is
                         actionable
POST   /request/:id     idempotent send-request (returns a status hint:
                         sent | already_sent | already_friends)
POST   /accept/:id      adds both sides to each other's friends array
POST   /decline/:id     drop the pending entry only
DELETE /:id             end friendship, removed from both sides
```

The Squad screen has three sections: **Add Agent** (debounced search +
Add), **Incoming Requests** (Accept / Decline), and **My Squad**
(Chat / Remove). Every mutation calls a single `refresh()` so the UI
stays consistent without optimistic-update bookkeeping.

### Realtime chat

Chat runs on the *same* HTTP server as Express — `index.js` now wraps
the app with `http.createServer(app)` and attaches a Socket.io server to
it, so realtime and REST traffic share one port and one CORS config.

```
Handshake auth   socket.handshake.auth.token = <JWT>
                  (pending / pre-2FA tokens are rejected)

Server -> client  chat:message  { _id, from, to, text, createdAt }
                  chat:typing   { from }

Client -> server  chat:send     { toUserId, text }     (with ack)
                  chat:typing   { toUserId }
```

Server-side rules:
- Both `chat:send` and `GET /api/chat/:peerId` verify the two players are
  *actually friends*, so a crafted socket call can't talk to non-friends
  and history can't leak by guessing user ids.
- Messages are persisted in `ChatMessage` (`from`, `to`, `text`,
  timestamps). A compound index on `(from, to, createdAt desc)` keeps
  the history query cheap.
- Online sockets are tracked in `services/chatSocket.js` as a
  `Map<userId, Set<socketId>>` so a player can have several tabs open
  and all of them receive the same message.
- Message text is trimmed and capped at 1000 chars.

The `ChatPanel` component is a 320×420 overlay anchored to the
bottom-right. Closing it disconnects the socket so an idle player
doesn't hold a long-lived connection. `chat:typing` is throttled to
one event per second on the sender and times out after 1.5s on the
receiver.

## Environment

No new required vars. Optional:

```env
# Realtime root (defaults to VITE_API_URL minus /api)
VITE_SOCKET_URL=
```

Mongo + JWT are already required; Redis is still optional and only used
for OTP / quiz session storage — chat does not depend on it.

## What this phase does NOT include

- **Group / squad-wide chat.** Only 1:1 conversations for now.
- **Unread badges or push notifications.** Messages only surface when
  the panel is open.
- **Anti-cheat / spam limits.** Per-socket message rate limiting is a
  Phase 6 hardening item.
- **Read receipts.** The ack confirms the server stored the message,
  not that the recipient has seen it.

See [`phase-3-gameplay.md`](./phase-3-gameplay.md) for the systems this
phase builds on; the shop and polish phases come next.
