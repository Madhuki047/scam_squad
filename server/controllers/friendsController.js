import mongoose from 'mongoose'
import User from '../models/User.js'
import { logActivity } from '../services/activityService.js'

// Public fields shown in any "list of players" response (friend list,
// pending requests, search results).
const PUBLIC_FIELDS = 'username level totalScore casesSolved'

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}

// Helper: ensure two distinct, well-formed user ids.
function pairOrError(meId, otherId, res) {
  if (!isValidId(otherId)) {
    res.status(400).json({ message: 'Invalid player id.' })
    return null
  }
  if (String(meId) === String(otherId)) {
    res.status(400).json({ message: 'You cannot do that to yourself.' })
    return null
  }
  return String(otherId)
}

// GET /api/friends - the signed-in player's friends (populated).
export async function listFriends(req, res, next) {
  try {
    const me = await User.findById(req.userId)
      .populate({ path: 'friends', select: PUBLIC_FIELDS })
      .select('friends')
    if (!me) return res.status(404).json({ message: 'Account not found.' })
    res.json({ items: me.friends || [] })
  } catch (error) {
    next(error)
  }
}

// GET /api/friends/requests - incoming pending friend requests.
export async function listRequests(req, res, next) {
  try {
    const me = await User.findById(req.userId)
      .populate({ path: 'pendingRequests', select: PUBLIC_FIELDS })
      .select('pendingRequests')
    if (!me) return res.status(404).json({ message: 'Account not found.' })
    res.json({ items: me.pendingRequests || [] })
  } catch (error) {
    next(error)
  }
}

// GET /api/friends/search?q=... - find players to add. Excludes the
// signed-in player and anyone already in their friends / pendingRequests
// list, so the UI shows only actionable matches.
export async function searchPlayers(req, res, next) {
  try {
    const q = String(req.query.q || '').trim()
    if (q.length < 2) {
      return res.json({ items: [] })
    }
    const me = await User.findById(req.userId).select(
      'friends pendingRequests',
    )
    if (!me) return res.status(404).json({ message: 'Account not found.' })

    // Anchor the prefix to keep the query cheap. Escape regex metachars.
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const excluded = [req.userId, ...(me.friends || []), ...(me.pendingRequests || [])]
    const items = await User.find({
      _id: { $nin: excluded },
      username: { $regex: new RegExp('^' + safe, 'i') },
    })
      .select(PUBLIC_FIELDS)
      .limit(10)

    res.json({ items })
  } catch (error) {
    next(error)
  }
}

// POST /api/friends/request/:userId - send a friend request to userId.
// Idempotent: a duplicate request returns 200 with no double-write.
export async function sendRequest(req, res, next) {
  try {
    const otherId = pairOrError(req.userId, req.params.userId, res)
    if (!otherId) return

    const other = await User.findById(otherId).select(
      'pendingRequests friends username',
    )
    if (!other) return res.status(404).json({ message: 'Player not found.' })

    // Already friends - nothing to do.
    if (other.friends?.some((id) => String(id) === String(req.userId))) {
      return res.json({ ok: true, status: 'already_friends' })
    }
    // Request already pending - nothing to do.
    if (other.pendingRequests?.some((id) => String(id) === String(req.userId))) {
      return res.json({ ok: true, status: 'already_sent' })
    }

    other.pendingRequests.push(req.userId)
    await other.save()
    res.json({ ok: true, status: 'sent' })
  } catch (error) {
    next(error)
  }
}

// POST /api/friends/accept/:userId - accept a pending request from userId.
// Adds both sides to each other's friends list and removes the pending
// entry. Both writes happen even if one side appears out of sync, so the
// state always reconciles toward "they are friends".
export async function acceptRequest(req, res, next) {
  try {
    const otherId = pairOrError(req.userId, req.params.userId, res)
    if (!otherId) return

    const [me, other] = await Promise.all([
      User.findById(req.userId),
      User.findById(otherId),
    ])
    if (!me) return res.status(404).json({ message: 'Account not found.' })
    if (!other) return res.status(404).json({ message: 'Player not found.' })

    const wasPending = me.pendingRequests?.some(
      (id) => String(id) === String(otherId),
    )
    if (!wasPending) {
      return res.status(400).json({ message: 'No pending request from that player.' })
    }

    me.pendingRequests = me.pendingRequests.filter(
      (id) => String(id) !== String(otherId),
    )
    if (!me.friends.some((id) => String(id) === String(otherId))) {
      me.friends.push(otherId)
    }
    if (!other.friends.some((id) => String(id) === String(req.userId))) {
      other.friends.push(req.userId)
    }

    await Promise.all([me.save(), other.save()])
    await Promise.all([
      logActivity(req.userId, 'squad', `Added ${other.username} to your squad`),
      logActivity(otherId, 'squad', `${me.username} joined your squad`),
    ])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}

// POST /api/friends/decline/:userId - remove a pending request without
// adding the sender as a friend.
export async function declineRequest(req, res, next) {
  try {
    const otherId = pairOrError(req.userId, req.params.userId, res)
    if (!otherId) return

    const me = await User.findById(req.userId)
    if (!me) return res.status(404).json({ message: 'Account not found.' })

    me.pendingRequests = (me.pendingRequests || []).filter(
      (id) => String(id) !== String(otherId),
    )
    await me.save()
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}

// DELETE /api/friends/:userId - end a friendship. Removes the entry from
// both sides so the relationship can't become one-way.
export async function removeFriend(req, res, next) {
  try {
    const otherId = pairOrError(req.userId, req.params.userId, res)
    if (!otherId) return

    const [me, other] = await Promise.all([
      User.findById(req.userId),
      User.findById(otherId),
    ])
    if (!me) return res.status(404).json({ message: 'Account not found.' })

    me.friends = (me.friends || []).filter(
      (id) => String(id) !== String(otherId),
    )
    if (other) {
      other.friends = (other.friends || []).filter(
        (id) => String(id) !== String(req.userId),
      )
    }
    await Promise.all([me.save(), other && other.save()].filter(Boolean))
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}
