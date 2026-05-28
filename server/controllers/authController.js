import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { applyRegen } from '../services/livesService.js'
import { saveOtp, checkOtp } from '../services/otpStore.js'
import { sendOtpEmail } from '../services/mailService.js'

// --- token helpers ---------------------------------------------------

// Full 7-day session token. The `protect` middleware accepts these.
function createSessionToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// Short-lived token that proves the password step passed but 2FA has
// NOT. Only verifyOtp accepts it; `protect` explicitly rejects it.
function createPendingToken(userId) {
  return jwt.sign({ id: userId, pending: true }, process.env.JWT_SECRET, {
    expiresIn: '10m',
  })
}

// Standard shape returned for a fully completed sign-in.
function sessionResponse(user) {
  return {
    token: createSessionToken(user._id),
    user: { id: user._id, username: user.username },
  }
}

// agent@mail.com -> a***t@mail.com, so the UI can hint where the code went.
function maskEmail(email) {
  const [name, domain] = email.split('@')
  if (name.length <= 2) return `${name[0]}***@${domain}`
  return `${name[0]}${'*'.repeat(name.length - 2)}${name.slice(-1)}@${domain}`
}

// --- controllers -----------------------------------------------------

// POST /api/auth/register - create a player account. Email is OPTIONAL;
// supplying one means future logins will require an emailed OTP.
export async function register(req, res, next) {
  try {
    const { username, password, email } = req.body

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Username and password are required.' })
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters.' })
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res
        .status(400)
        .json({ message: 'That email address looks invalid.' })
    }

    if (await User.findOne({ username })) {
      return res
        .status(409)
        .json({ message: 'That code name is already taken.' })
    }
    if (email && (await User.findOne({ email: email.toLowerCase() }))) {
      return res
        .status(409)
        .json({ message: 'That email is already registered.' })
    }

    const user = await User.create({
      username,
      password,
      ...(email ? { email } : {}),
    })

    // Registration signs the player straight in - no OTP on the first
    // session (the email is not verified yet, and this keeps sign-up simple).
    res.status(201).json(sessionResponse(user))
  } catch (error) {
    next(error)
  }
}

// POST /api/auth/login - verify the password. Accounts with an email get
// only a PENDING token plus an emailed OTP and must finish at
// /verify-otp; email-less accounts sign in immediately.
export async function login(req, res, next) {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Username and password are required.' })
    }

    const user = await User.findOne({ username })
    const passwordMatches = user && (await user.comparePassword(password))
    if (!passwordMatches) {
      return res
        .status(401)
        .json({ message: 'Invalid code name or password.' })
    }

    applyRegen(user)
    user.lastLogin = new Date()
    await user.save()

    // No email on file -> no second factor, straight in.
    if (!user.email) {
      return res.json(sessionResponse(user))
    }

    // 2FA: generate, store and email a 6-digit code.
    const code = String(crypto.randomInt(100000, 1000000))
    await saveOtp(String(user._id), code)
    await sendOtpEmail(user.email, code)

    res.json({
      otpRequired: true,
      pendingToken: createPendingToken(user._id),
      emailHint: maskEmail(user.email),
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/auth/verify-otp - exchange a pending token + OTP for a full
// session.
export async function verifyOtp(req, res, next) {
  try {
    const { pendingToken, code } = req.body
    if (!pendingToken || !code) {
      return res
        .status(400)
        .json({ message: 'Verification code is required.' })
    }

    let payload
    try {
      payload = jwt.verify(pendingToken, process.env.JWT_SECRET)
    } catch {
      return res
        .status(401)
        .json({ message: 'Your sign-in attempt expired. Please log in again.' })
    }
    if (!payload.pending) {
      return res.status(400).json({ message: 'Invalid verification request.' })
    }

    const result = await checkOtp(payload.id, String(code).trim())
    if (result === 'expired') {
      return res
        .status(401)
        .json({ message: 'That code has expired. Please log in again.' })
    }
    if (result === 'mismatch') {
      return res.status(401).json({ message: 'Incorrect code. Try again.' })
    }

    const user = await User.findById(payload.id)
    if (!user) {
      return res.status(404).json({ message: 'Account not found.' })
    }
    if (applyRegen(user)) await user.save()
    res.json(sessionResponse(user))
  } catch (error) {
    next(error)
  }
}

// POST /api/auth/logout - JWTs are stateless, so "logging out" is really
// the client discarding its token. This endpoint exists so the client
// has one place to call; server-side token revocation (a Redis denylist)
// is a later hardening step.
export function logout(req, res) {
  res.json({ ok: true })
}
