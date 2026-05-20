import { redis, isRedisReady } from './redisService.js'

// Short-lived per-user quiz session state. Mirrors the otpStore pattern:
// Redis when available (so it survives a restart / works across
// instances), falls back to an in-process Map otherwise.
//
// The whole session blob (current question, streak, level, results)
// lives behind one key per user; updates are read-modify-write.

const TTL_SECONDS = 15 * 60

// Fallback store: userId -> { data, expiresAt }
const memoryStore = new Map()

const key = (userId) => `quiz:${userId}`

export async function getSession(userId) {
  if (isRedisReady()) {
    const raw = await redis.get(key(userId))
    return raw ? JSON.parse(raw) : null
  }
  const entry = memoryStore.get(userId)
  if (!entry || entry.expiresAt < Date.now()) {
    memoryStore.delete(userId)
    return null
  }
  return entry.data
}

export async function saveSession(userId, data) {
  if (isRedisReady()) {
    await redis.set(key(userId), JSON.stringify(data), 'EX', TTL_SECONDS)
  } else {
    memoryStore.set(userId, {
      data,
      expiresAt: Date.now() + TTL_SECONDS * 1000,
    })
  }
}

export async function clearSession(userId) {
  if (isRedisReady()) {
    await redis.del(key(userId))
  } else {
    memoryStore.delete(userId)
  }
}
