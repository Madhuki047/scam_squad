import jwt from 'jsonwebtoken'

// Route guard for protected endpoints. Reads the JWT from the
// "Authorization: Bearer <token>" header, verifies it, and attaches the
// player's id to req.userId. Use it on any route that requires a login.
function protect(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Not authorised.' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    // Pending tokens prove the password step only - they must not grant
    // access to real endpoints until 2FA is completed at /verify-otp.
    if (payload.pending) {
      return res
        .status(401)
        .json({ message: 'Two-factor verification not completed.' })
    }

    req.userId = payload.id
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired session.' })
  }
}

export default protect
