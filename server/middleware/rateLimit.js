// Per-user, in-process rate limiter. Trades coordination across instances
// for zero dependencies and zero infrastructure: a single Express
// instance is enough to honour the documented anti-cheat limits on
// POST /api/lives/use (3/min) and POST /api/quiz/answer (1/2s).
//
// Limits are applied AFTER `protect`, so the bucket key is always
// `userId + route`. Pre-auth abuse falls to the JWT itself: no valid
// token, no protected route, no quota consumed.
//
// On exceed: HTTP 429 with a JSON body and a Retry-After header (seconds
// rounded up).

const buckets = new Map() // `${userId}|${id}` -> number[] of timestamps

// Periodic sweep so the map can't grow unbounded under churn.
const SWEEP_INTERVAL_MS = 60_000
setInterval(() => {
  const now = Date.now()
  for (const [key, hits] of buckets) {
    // Drop entries whose newest hit is older than 5 minutes.
    if (hits.length === 0 || now - hits[hits.length - 1] > 5 * 60_000) {
      buckets.delete(key)
    }
  }
}, SWEEP_INTERVAL_MS).unref?.()

// Build a middleware. `id` namespaces the bucket; `windowMs` is the
// sliding window in ms; `max` is the most calls allowed in that window.
export function rateLimit({ id, windowMs, max }) {
  return function rateLimiter(req, res, next) {
    if (!req.userId) {
      // Should never happen behind `protect`, but fail open in that
      // case rather than 500-ing.
      return next()
    }
    const now = Date.now()
    const key = `${req.userId}|${id}`
    const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs)

    if (hits.length >= max) {
      const oldest = hits[0]
      const retryAfter = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000))
      res.setHeader('Retry-After', String(retryAfter))
      return res.status(429).json({
        message: 'Too many requests. Slow down.',
        retryAfterSeconds: retryAfter,
      })
    }

    hits.push(now)
    buckets.set(key, hits)
    next()
  }
}
