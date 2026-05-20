import { redis, isRedisReady } from './redisService.js'

// Stores short-lived 2FA one-time codes.
//
// Uses Redis when it is available (survives a server restart, works
// across multiple server instances). Falls back to an in-process Map so
// 2FA is fully testable without Redis configured.
//
// Each entry holds { code, attempts }. Codes live 5 minutes, are
// single-use, and are dropped after 5 wrong attempts (basic brute-force
// protection).

const TTL_SECONDS = 5 * 60
const MAX_ATTEMPTS = 5

// Fallback store: userId -> { code, attempts, expiresAt }
const memoryStore = new Map()

const key = (userId) => `otp:${userId}`

// Save (overwriting any previous code) for a user.
export async function saveOtp(userId, code) {
  const entry = { code, attempts: 0 }

  if (isRedisReady()) {
    await redis.set(key(userId), JSON.stringify(entry), 'EX', TTL_SECONDS)
  } else {
    memoryStore.set(userId, {
      ...entry,
      expiresAt: Date.now() + TTL_SECONDS * 1000,
    })
  }
}

// Check a submitted code. Returns:
//   'ok'       - matched; the code is consumed
//   'mismatch' - wrong code; the attempt is counted
//   'expired'  - no code on file, expired, or too many wrong attempts
export async function checkOtp(userId, code) {
  if (isRedisReady()) {
    const raw = await redis.get(key(userId))
    if (!raw) return 'expired'

    const entry = JSON.parse(raw)
    if (entry.code === code) {
      await redis.del(key(userId))
      return 'ok'
    }

    entry.attempts += 1
    if (entry.attempts >= MAX_ATTEMPTS) {
      await redis.del(key(userId))
      return 'expired'
    }
    // Re-store with the remaining TTL so attempts can't reset the clock.
    const ttl = await redis.ttl(key(userId))
    await redis.set(
      key(userId),
      JSON.stringify(entry),
      'EX',
      ttl > 0 ? ttl : TTL_SECONDS,
    )
    return 'mismatch'
  }

  // Memory fallback.
  const entry = memoryStore.get(userId)
  if (!entry || entry.expiresAt < Date.now()) {
    memoryStore.delete(userId)
    return 'expired'
  }
  if (entry.code === code) {
    memoryStore.delete(userId)
    return 'ok'
  }
  entry.attempts += 1
  if (entry.attempts >= MAX_ATTEMPTS) {
    memoryStore.delete(userId)
    return 'expired'
  }
  return 'mismatch'
}
