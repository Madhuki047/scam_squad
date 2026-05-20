// Minimal security-headers middleware. Avoids adding a dependency on
// helmet for what amounts to a handful of static headers; for an
// API-only backend the surface area is small.
//
// Notes:
// - The API only ever sends JSON (no HTML). Browsers won't render it as
//   a document, but the headers cost nothing to send anyway.
// - X-Frame-Options: DENY blocks framing of any API response (clickjack
//   defence). Express doesn't serve the frontend, so this never hurts.
// - Referrer-Policy: no-referrer keeps the API's URL out of cross-site
//   referrers when a browser ever does navigate to it.
// - HSTS is set conditionally: it only matters under HTTPS. Sent
//   always-on so reverse proxies (Railway etc.) terminating TLS can
//   forward it through.
export default function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains',
  )
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=()')
  next()
}
