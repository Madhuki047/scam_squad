import mongoose from 'mongoose'
import User from '../models/User.js'
import { logActivity } from '../services/activityService.js'

// Public fields safe to show for any player in the social UI.
const PUBLIC = 'username xp level casesSolved'

const ids = (arr) => (arr || []).map(String)

// GET /api/friends - the player's confirmed friends and the incoming
// requests waiting on them (pendingRequests holds people who asked YOU).
export async function listFriends(req, res, next) {
  try {
    const user = await User.findById(req.userId)
      .populate('friends', PUBLIC)
      .populate('pendingRequests', PUBLIC)
    if (!user) return res.status(404).json({ message: 'Account not found.' })
    res.json({ friends: user.friends, pending: user.pendingRequests })
  } catch (error) {
    next(error)
  }
}

// GET /api/friends/search?q= - username substring match (case-insensitive),
// excluding the player themselves. Each result carries a status so the UI
// knows whether to show Add / Pending / Accept / Friends.
export async function searchUsers(req, res, next) {
  try {
    const q = String(req.query.q || '').trim()
    if (q.length < 2) return res.json({ results: [] })

    const me = await User.findById(req.userId).select('friends pendingRequests')
    if (!me) return res.status(404).json({ message: 'Account not found.' })
    const friendIds = new Set(ids(me.friends))
    const incomingIds = new Set(ids(me.pendingRequests))

    // Escape regex metacharacters so a literal username is matched.
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const matches = await User.find({
      username: { $regex: escaped, $options: 'i' },
      _id: { $ne: req.userId },
    })
      .limit(10)
      .select('username xp level pendingRequests')

    const results = matches.map((u) => {
      let status = 'none'
      if (friendIds.has(String(u._id))) status = 'friend'
      else if (incomingIds.has(String(u._id)))
        status = 'incoming' // they already asked you
      else if (ids(u.pendingRequests).includes(String(req.userId)))
        status = 'requested' // you already asked them
      return {
        id: u._id,
        username: u.username,
        xp: u.xp || 0,
        level: u.level || 1,
        status,
      }
    })
    res.json({ results })
  } catch (error) {
    next(error)
  }
}

// Add each player to the other's friends list (idempotent).
function bond(a, b) {
  if (!ids(a.friends).includes(String(b._id))) a.friends.push(b._id)
  if (!ids(b.friends).includes(String(a._id))) b.friends.push(a._id)
}

// POST /api/friends/request/:id - send a friend request. If the target
// has already requested you, this confirms the friendship instead.
export async function sendRequest(req, res, next) {
  try {
    const targetId = req.params.id
    if (!mongoose.isValidObjectId(targetId))
      return res.status(400).json({ message: 'Invalid user id.' })
    if (String(targetId) === String(req.userId))
      return res.status(400).json({ message: "You can't add yourself." })

    const target = await User.findById(targetId)
    if (!target) return res.status(404).json({ message: 'Player not found.' })
    const me = await User.findById(req.userId)

    if (ids(me.friends).includes(String(targetId)))
      return res.status(400).json({ message: 'Already friends.' })

    // They already asked you -> accept rather than duplicate.
    if (ids(me.pendingRequests).includes(String(targetId))) {
      me.pendingRequests = me.pendingRequests.filter(
        (x) => String(x) !== String(targetId),
      )
      bond(me, target)
      await me.save()
      await target.save()
      return res.json({ ok: true, status: 'friend' })
    }

    if (!ids(target.pendingRequests).includes(String(req.userId))) {
      target.pendingRequests.push(req.userId)
      await target.save()
    }
    res.json({ ok: true, status: 'requested' })
  } catch (error) {
    next(error)
  }
}

// POST /api/friends/accept/:id - accept an incoming request.
export async function acceptRequest(req, res, next) {
  try {
    const fromId = req.params.id
    if (!mongoose.isValidObjectId(fromId))
      return res.status(400).json({ message: 'Invalid user id.' })

    const me = await User.findById(req.userId)
    if (!me) return res.status(404).json({ message: 'Account not found.' })
    if (!ids(me.pendingRequests).includes(String(fromId)))
      return res.status(400).json({ message: 'No such request.' })

    const from = await User.findById(fromId)
    if (!from) return res.status(404).json({ message: 'Player not found.' })

    me.pendingRequests = me.pendingRequests.filter(
      (x) => String(x) !== String(fromId),
    )
    bond(me, from)
    await me.save()
    await from.save()
    await logActivity(req.userId, 'friend', `Added ${from.username} to the squad`)
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}

// POST /api/friends/decline/:id - drop an incoming request.
export async function declineRequest(req, res, next) {
  try {
    const fromId = req.params.id
    const me = await User.findById(req.userId)
    if (!me) return res.status(404).json({ message: 'Account not found.' })
    me.pendingRequests = me.pendingRequests.filter(
      (x) => String(x) !== String(fromId),
    )
    await me.save()
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}

// POST /api/friends/remove/:id - remove a friend (both directions).
export async function removeFriend(req, res, next) {
  try {
    const otherId = req.params.id
    const me = await User.findById(req.userId)
    if (!me) return res.status(404).json({ message: 'Account not found.' })
    me.friends = me.friends.filter((x) => String(x) !== String(otherId))
    await me.save()
    const other = await User.findById(otherId)
    if (other) {
      other.friends = other.friends.filter(
        (x) => String(x) !== String(req.userId),
      )
      await other.save()
    }
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}
