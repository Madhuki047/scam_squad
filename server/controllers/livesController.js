import User from '../models/User.js'
import {
  applyRegen,
  getNextRegenAt,
  useLife,
  MAX_LIVES,
  REGEN_INTERVAL_MS,
} from '../services/livesService.js'
import { logActivity } from '../services/activityService.js'

// Shape returned by both endpoints so the client only has to parse one
// thing.
function livesPayload(user) {
  return {
    livesRemaining: user.livesRemaining,
    maxLives: MAX_LIVES,
    lastLifeRegen: user.lastLifeRegen,
    nextRegenAt: getNextRegenAt(user),
    regenIntervalMs: REGEN_INTERVAL_MS,
  }
}

// GET /api/lives - current count, plus when the next one regenerates.
// Settles any pending regen first so a returning player gets up-to-date
// values without needing to hit any other endpoint.
export async function getLives(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'Account not found.' })

    if (applyRegen(user)) await user.save()
    res.json(livesPayload(user))
  } catch (error) {
    next(error)
  }
}

// POST /api/lives/use - called by the case team when a player fails a
// case. Returns 409 if the player is already out of lives.
//
// PHASE 6: rate-limit this to max 3 calls / minute / user.
export async function spendLife(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'Account not found.' })

    const remaining = useLife(user)
    if (remaining === null) {
      return res
        .status(409)
        .json({ message: 'No lives remaining.', ...livesPayload(user) })
    }

    await user.save()
    await logActivity(req.userId, 'life', 'Lost a life', 0)
    res.json(livesPayload(user))
  } catch (error) {
    next(error)
  }
}
