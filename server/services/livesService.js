// Lives regeneration logic. Pure helpers that mutate a User document
// in-memory; the caller decides when to .save().
//
// Design note: the spec mentions Redis for cooldown timestamps, but the
// authoritative clock lives on `user.lastLifeRegen` in Mongo so a single
// instance is fully self-sufficient (and the dev server runs without
// Redis). Redis becomes interesting once there are multiple instances
// or when rate-limit windows are added in Phase 6.

export const MAX_LIVES = 3
export const REGEN_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes

// Apply any owed regenerations to the user. Returns true if anything
// changed (so the caller knows to save).
//
// Pattern: each whole 30-minute tick since `lastLifeRegen` adds one
// life (capped at MAX). `lastLifeRegen` is then advanced by exactly
// `appliedTicks * interval` so partial ticks aren't thrown away - a
// player who returns 31 minutes later still has 1 minute of cooldown
// banked toward the next regen.
export function applyRegen(user) {
  const now = Date.now()

  if (user.livesRemaining > MAX_LIVES) {
    user.livesRemaining = MAX_LIVES
    user.lastLifeRegen = new Date(now)
    return true
  }

  if (user.livesRemaining >= MAX_LIVES) {
    // Full - pin the clock to "now" so a future loss starts a fresh
    // 30-minute countdown rather than instantly regenerating.
    if (
      !user.lastLifeRegen ||
      Math.abs(user.lastLifeRegen.getTime() - now) > 1000
    ) {
      user.lastLifeRegen = new Date(now)
      return true
    }
    return false
  }

  const last = user.lastLifeRegen ? user.lastLifeRegen.getTime() : now
  const elapsed = now - last
  if (elapsed < REGEN_INTERVAL_MS) return false

  const ticks = Math.floor(elapsed / REGEN_INTERVAL_MS)
  const apply = Math.min(ticks, MAX_LIVES - user.livesRemaining)
  user.livesRemaining += apply
  user.lastLifeRegen = new Date(last + apply * REGEN_INTERVAL_MS)

  if (user.livesRemaining >= MAX_LIVES) {
    user.lastLifeRegen = new Date(now)
  }
  return true
}

// Timestamp (ms since epoch) of the next regen, or null when already full.
export function getNextRegenAt(user) {
  if (user.livesRemaining >= MAX_LIVES) return null
  const last = user.lastLifeRegen ? user.lastLifeRegen.getTime() : Date.now()
  return last + REGEN_INTERVAL_MS
}

// Decrement a life. Returns the new count, or null if the player has
// none to spend. Settling any pending regen first means a stale request
// can't drain a life that should already have been regenerated.
export function useLife(user) {
  applyRegen(user)
  if (user.livesRemaining <= 0) return null

  const wasFull = user.livesRemaining === MAX_LIVES
  user.livesRemaining -= 1
  // If we were at the cap, the cooldown wasn't running - kick it off now.
  // Otherwise leave `lastLifeRegen` alone so the existing countdown
  // continues.
  if (wasFull) user.lastLifeRegen = new Date(Date.now())

  return user.livesRemaining
}

// Award a life (e.g. quiz reward). Returns true if applied, false when
// already at the cap.
export function grantLife(user) {
  applyRegen(user)
  if (user.livesRemaining >= MAX_LIVES) return false

  user.livesRemaining += 1
  if (user.livesRemaining >= MAX_LIVES) user.lastLifeRegen = new Date(Date.now())
  return true
}
