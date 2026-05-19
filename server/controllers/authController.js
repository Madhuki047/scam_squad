import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Create a signed JWT for the given user id.
function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

// POST /api/auth/register - create a new player account.
export async function register(req, res, next) {
  try {
    const { username, password } = req.body

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

    const existing = await User.findOne({ username })
    if (existing) {
      return res
        .status(409)
        .json({ message: 'That code name is already taken.' })
    }

    const user = await User.create({ username, password })
    const token = createToken(user._id)

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username },
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/auth/login - sign in an existing player.
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

    const token = createToken(user._id)

    res.json({
      token,
      user: { id: user._id, username: user.username },
    })
  } catch (error) {
    next(error)
  }
}
