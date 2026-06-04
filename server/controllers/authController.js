import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { applyRegen } from '../services/livesService.js'
import { sendOtpEmail } from '../services/mailService.js'

const PIN_TTL_MS = 10 * 60 * 1000
const PIN_RESEND_MS = 60 * 1000
const PIN_MAX_ATTEMPTS = 5

// --- token helpers ---------------------------------------------------

function createSessionToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function createPendingToken(userId, purpose = 'login') {
  return jwt.sign({ id: userId, pending: true, purpose }, process.env.JWT_SECRET, {
    expiresIn: '10m',
  })
}

function sessionResponse(user) {
  return {
    token: createSessionToken(user._id),
    user: { id: user._id, username: user.username },
  }
}

function maskEmail(email = '') {
  const [name = '', domain = ''] = email.split('@')
  if (!name || !domain) return ''
  if (name.length <= 2) return `${name[0] || '*'}***@${domain}`
  return `${name[0]}${'*'.repeat(name.length - 2)}${name.slice(-1)}@${domain}`
}

function hashPin(pin) {
  return crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(String(pin))
    .digest('hex')
}

function generatePin() {
  return String(crypto.randomInt(100000, 1000000))
}

function clearVerification(user) {
  user.verificationCodeHash = null
  user.verificationCodeExpires = null
  user.verificationCodeSentAt = null
  user.verificationCodeAttempts = 0
  user.pendingEmail = null
}

async function issueVerificationPin(user, { force = false, email } = {}) {
  const targetEmail = email || user.email
  if (!targetEmail) {
    const error = new Error('Add an email address before email verification can be used.')
    error.status = 409
    throw error
  }

  const now = Date.now()
  const lastSent = user.verificationCodeSentAt?.getTime?.() || 0
  if (!force && lastSent && now - lastSent < PIN_RESEND_MS) {
    const waitSeconds = Math.ceil((PIN_RESEND_MS - (now - lastSent)) / 1000)
    const error = new Error(`Please wait ${waitSeconds} seconds before requesting another PIN.`)
    error.status = 429
    throw error
  }

  const pin = generatePin()
  user.verificationCodeHash = hashPin(pin)
  user.verificationCodeExpires = new Date(now + PIN_TTL_MS)
  user.verificationCodeSentAt = new Date(now)
  user.verificationCodeAttempts = 0
  await sendOtpEmail(targetEmail, pin)
  await user.save()
}

function pendingResponse(user, purpose, email = user.email) {
  return {
    otpRequired: true,
    pendingToken: createPendingToken(user._id, purpose),
    emailHint: maskEmail(email),
    purpose,
    expiresInSeconds: Math.floor(PIN_TTL_MS / 1000),
  }
}

function verifyPendingToken(pendingToken) {
  try {
    const payload = jwt.verify(pendingToken, process.env.JWT_SECRET)
    if (!payload.pending) return null
    return payload
  } catch {
    return null
  }
}

function normalizeEmail(email) {
  return email?.trim().toLowerCase()
}

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email)
}

// --- controllers -----------------------------------------------------

export async function register(req, res, next) {
  try {
    const { username, password, email } = req.body
    const normalizedEmail = normalizeEmail(email)

    if (!username || !password || !normalizedEmail) {
      return res
        .status(400)
        .json({ message: 'Username, password, and email are required.' })
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters.' })
    }
    if (!isValidEmail(normalizedEmail)) {
      return res
        .status(400)
        .json({ message: 'That email address looks invalid.' })
    }

    if (await User.findOne({ username })) {
      return res
        .status(409)
        .json({ message: 'That code name is already taken.' })
    }
    if (await User.findOne({ email: normalizedEmail })) {
      return res
        .status(409)
        .json({ message: 'That email is already registered.' })
    }

    const user = new User({
      username,
      password,
      email: normalizedEmail,
      emailVerified: false,
      twoFactorEnabled: true,
    })

    await issueVerificationPin(user, { force: true })
    res.status(201).json(pendingResponse(user, 'register'))
  } catch (error) {
    next(error)
  }
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Username or email and password are required.' })
    }

    const identifier = username.trim()
    const query = identifier.includes('@')
      ? { email: identifier.toLowerCase() }
      : { username: identifier }
    const user = await User.findOne(query)
    const passwordMatches = user && (await user.comparePassword(password))
    if (!passwordMatches) {
      return res
        .status(401)
        .json({ message: 'Invalid code name/email or password.' })
    }

    if (!user.email) {
      return res.status(409).json({
        emailRequired: true,
        pendingToken: createPendingToken(user._id, 'add_email'),
        purpose: 'add_email',
        message:
          'This account needs an email address before Agent Verification can be used. Add or confirm an email to continue.',
      })
    }

    applyRegen(user)
    user.lastLogin = new Date()
    if (user.emailVerified == null) user.emailVerified = false
    if (user.twoFactorEnabled == null) user.twoFactorEnabled = true
    await issueVerificationPin(user, { force: true })

    res.json(pendingResponse(user, 'login'))
  } catch (error) {
    next(error)
  }
}

export async function addEmailForVerification(req, res, next) {
  try {
    const { pendingToken, email } = req.body
    const normalizedEmail = normalizeEmail(email)

    if (!pendingToken) {
      return res.status(400).json({ message: 'Verification session is required.' })
    }
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required.' })
    }
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'That email address looks invalid.' })
    }

    const payload = verifyPendingToken(pendingToken)
    if (!payload || payload.purpose !== 'add_email') {
      return res
        .status(401)
        .json({ message: 'Your email verification session expired. Please log in again.' })
    }

    const user = await User.findById(payload.id)
    if (!user) return res.status(404).json({ message: 'Account not found.' })
    if (user.email) {
      return res.status(409).json({
        message: 'This account already has an email address. Please log in again.',
      })
    }
    if (await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } })) {
      return res.status(409).json({ message: 'That email is already registered.' })
    }

    user.pendingEmail = normalizedEmail
    await issueVerificationPin(user, { force: true, email: normalizedEmail })
    res.json(pendingResponse(user, 'add_email', normalizedEmail))
  } catch (error) {
    next(error)
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { pendingToken, code } = req.body
    const pin = String(code || '').trim()
    if (!pendingToken || !pin) {
      return res.status(400).json({ message: 'Verification PIN is required.' })
    }
    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({ message: 'Enter the 6-digit verification PIN.' })
    }

    const payload = verifyPendingToken(pendingToken)
    if (!payload) {
      return res
        .status(401)
        .json({ message: 'Your verification attempt expired. Please log in again.' })
    }

    const user = await User.findById(payload.id)
    if (!user) return res.status(404).json({ message: 'Account not found.' })
    const targetEmail =
      payload.purpose === 'add_email' ? user.pendingEmail : user.email
    if (!targetEmail) {
      return res.status(409).json({
        message: 'No email address is attached to this verification request.',
      })
    }
    if (!user.verificationCodeHash || !user.verificationCodeExpires) {
      return res.status(400).json({ message: 'No verification PIN is active.' })
    }
    if (user.verificationCodeExpires.getTime() < Date.now()) {
      clearVerification(user)
      await user.save()
      return res
        .status(401)
        .json({ message: 'That PIN has expired. Request a new one.' })
    }

    if (user.verificationCodeHash !== hashPin(pin)) {
      user.verificationCodeAttempts = (user.verificationCodeAttempts || 0) + 1
      if (user.verificationCodeAttempts >= PIN_MAX_ATTEMPTS) {
        clearVerification(user)
        await user.save()
        return res
          .status(401)
          .json({ message: 'Too many incorrect PIN attempts. Request a new PIN.' })
      }
      await user.save()
      return res.status(401).json({ message: 'Invalid verification PIN.' })
    }

    if (payload.purpose === 'add_email') {
      if (await User.findOne({ email: targetEmail, _id: { $ne: user._id } })) {
        clearVerification(user)
        await user.save()
        return res.status(409).json({ message: 'That email is already registered.' })
      }
      user.email = targetEmail
    }
    user.emailVerified = true
    user.twoFactorEnabled = user.twoFactorEnabled ?? true
    clearVerification(user)
    if (applyRegen(user)) {
      // applyRegen mutates the user; save below covers it.
    }
    await user.save()
    res.json(sessionResponse(user))
  } catch (error) {
    next(error)
  }
}

export async function resendOtp(req, res, next) {
  try {
    const { pendingToken } = req.body
    if (!pendingToken) {
      return res.status(400).json({ message: 'Verification session is required.' })
    }

    const payload = verifyPendingToken(pendingToken)
    if (!payload) {
      return res
        .status(401)
        .json({ message: 'Your verification attempt expired. Please log in again.' })
    }

    const user = await User.findById(payload.id)
    if (!user) return res.status(404).json({ message: 'Account not found.' })
    const targetEmail =
      payload.purpose === 'add_email' ? user.pendingEmail : user.email
    await issueVerificationPin(user, { email: targetEmail })
    res.json({
      ok: true,
      emailHint: maskEmail(targetEmail),
      expiresInSeconds: Math.floor(PIN_TTL_MS / 1000),
    })
  } catch (error) {
    next(error)
  }
}

export function logout(req, res) {
  res.json({ ok: true })
}
