import Redis from 'ioredis'

// Redis is used (from Phase 3 onward) for things that are short-lived or
// need atomic counters: life-regen cooldown timestamps, OTP codes, and
// rate-limit windows. None of that runs yet in Phase 1 - this module just
// establishes the connection so later phases can `import { redis }`.
//
// Connection is intentionally NON-FATAL: unlike the MongoDB connection,
// the server still starts if Redis is unavailable, so you can develop
// auth and UI without an Upstash instance. Later phases that genuinely
// need Redis should check `isRedisReady()` first.

let redis = null

// `lazyConnect` keeps the constructor from throwing on a bad URL; we
// trigger the actual connection explicitly in connectRedis().
function createClient(url) {
  return new Redis(url, {
    lazyConnect: true,
    // Don't let a flaky Redis hang request handlers forever.
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
  })
}

// Called once at startup from index.js. Resolves whether or not Redis
// actually connects, so it can never block the server from listening.
async function connectRedis() {
  const url = process.env.REDIS_URL

  if (!url) {
    console.warn(
      'REDIS_URL is not set - Redis features (lives cooldown, rate limits, OTP) will be disabled.',
    )
    return null
  }

  redis = createClient(url)

  // Log connection state changes instead of crashing on error.
  redis.on('error', (err) => {
    console.warn('Redis error:', err.message)
  })
  redis.on('connect', () => {
    console.log('Redis connected')
  })

  try {
    await redis.connect()
  } catch (error) {
    console.warn('Redis connection failed:', error.message)
  }

  return redis
}

// True only when a client exists and the socket is ready for commands.
function isRedisReady() {
  return Boolean(redis) && redis.status === 'ready'
}

export { redis, connectRedis, isRedisReady }
