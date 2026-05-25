const LOCAL_ORIGINS = ['http://localhost:5173', 'http://localhost:3000']

function toOrigin(value) {
  if (!value || !value.trim()) return null

  try {
    return new URL(value.trim()).origin
  } catch {
    return value.trim().replace(/\/+$/, '')
  }
}

function splitOrigins(value) {
  return (value || '')
    .split(',')
    .map(toOrigin)
    .filter(Boolean)
}

export function getAllowedOrigins() {
  return Array.from(
    new Set([
      ...LOCAL_ORIGINS,
      ...splitOrigins(process.env.CLIENT_URL),
      ...splitOrigins(process.env.CLIENT_URLS),
    ]),
  )
}

export function createCorsOptions() {
  const allowedOrigins = getAllowedOrigins()

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true)
        return
      }

      const normalizedOrigin = toOrigin(origin)
      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true)
        return
      }

      callback(new Error(`CORS blocked origin: ${origin}`))
    },
    credentials: true,
  }
}
