import User from '../models/User.js'
import { applyRegen } from '../services/livesService.js'

// Public subset - shown when viewing another player's profile.
const PUBLIC_PROJECTION =
  'username totalScore casesSolved accuracy rank level badges createdAt'

// Return a user document without the password hash.
function safeUser(user) {
  const obj = user.toObject()
  delete obj.password
  return obj
}

// GET /api/user/me - the signed-in player's full record. Also settles
// any pending lives regeneration so every screen that reads the user
// sees up-to-date lives without polling /api/lives separately.
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'Account not found.' })

    if (applyRegen(user)) await user.save()
    res.json({ user: safeUser(user) })
  } catch (error) {
    next(error)
  }
}

// PATCH /api/user/me - update the signed-in player's own account. Any of
// the following may be present, independently:
//   - notifications      (settings.notifications.*)
//   - email              (add or change; enables/keeps 2FA)
//   - currentPassword + newPassword  (password change)
export async function updateMe(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'Account not found.' })

    const { notifications, email, currentPassword, newPassword, customTitle } =
      req.body

    // Custom Title cosmetic. Only players who bought it (inventory.titleOwned)
    // may set or change the title shown on their profile.
    if (typeof customTitle === 'string') {
      if (!user.inventory?.titleOwned) {
        return res
          .status(403)
          .json({ message: 'Buy the Custom Title cosmetic to set a title.' })
      }
      user.customTitle = customTitle.trim().slice(0, 30)
    }

    // Notification preferences.
    if (notifications && typeof notifications === 'object') {
      // Guard accounts created before this phase added `settings`.
      if (!user.settings) user.settings = {}
      if (!user.settings.notifications) user.settings.notifications = {}
      for (const k of ['lifeRegen', 'squadInvites', 'dailyQuiz']) {
        if (typeof notifications[k] === 'boolean') {
          user.settings.notifications[k] = notifications[k]
        }
      }
    }

    // Email add/change.
    if (typeof email === 'string') {
      const nextEmail = email.trim().toLowerCase()
      if (nextEmail && !/^\S+@\S+\.\S+$/.test(nextEmail)) {
        return res
          .status(400)
          .json({ message: 'That email address looks invalid.' })
      }
      if (nextEmail && nextEmail !== user.email) {
        if (await User.findOne({ email: nextEmail })) {
          return res
            .status(409)
            .json({ message: 'That email is already registered.' })
        }
      }
      user.email = nextEmail || undefined
    }

    // Password change - requires the current password.
    if (newPassword) {
      if (!currentPassword || !(await user.comparePassword(currentPassword))) {
        return res
          .status(401)
          .json({ message: 'Current password is incorrect.' })
      }
      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ message: 'New password must be at least 8 characters.' })
      }
      user.password = newPassword // hashed by the model's pre-save hook
    }

    await user.save()
    res.json({ user: safeUser(user) })
  } catch (error) {
    next(error)
  }
}

// DELETE /api/user/me - permanently remove the signed-in player.
export async function deleteMe(req, res, next) {
  try {
    await User.findByIdAndDelete(req.userId)
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}

// GET /api/user/:id - another player's public profile.
export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select(PUBLIC_PROJECTION)
    if (!user) return res.status(404).json({ message: 'Player not found.' })
    res.json({ user })
  } catch (error) {
    next(error)
  }
}
