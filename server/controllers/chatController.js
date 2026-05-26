import mongoose from 'mongoose'
import ChatMessage from '../models/ChatMessage.js'
import User from '../models/User.js'

// GET /api/chat/:peerId
// Returns the most recent 100 messages exchanged between the signed-in
// player and peerId, oldest first (so the UI can append new messages at
// the bottom without resorting). Refuses to return messages unless the
// two players are actually friends, so chat history can't leak by
// guessing user ids.
export async function getHistory(req, res, next) {
  try {
    const me = req.userId
    const peer = req.params.peerId

    const meDoc = await User.findById(me).select('friends')
    if (!meDoc) return res.status(404).json({ message: 'Account not found.' })
    if (!meDoc.friends?.some((id) => String(id) === String(peer))) {
      return res
        .status(403)
        .json({ message: 'You can only read chats with squad members.' })
    }

    const items = await ChatMessage.find({
      $or: [
        { from: me, to: peer },
        { from: peer, to: me },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(100)

    await ChatMessage.updateMany(
      { from: peer, to: me, readAt: null },
      { $set: { readAt: new Date() } },
    )

    res.json({ items: items.reverse() })
  } catch (error) {
    next(error)
  }
}

export async function getUnreadSummary(req, res, next) {
  try {
    const rows = await ChatMessage.aggregate([
      {
        $match: {
          to: new mongoose.Types.ObjectId(req.userId),
          readAt: null,
        },
      },
      {
        $group: {
          _id: '$from',
          count: { $sum: 1 },
        },
      },
    ])

    const byFriend = {}
    let total = 0
    rows.forEach((row) => {
      const count = row.count || 0
      byFriend[String(row._id)] = count
      total += count
    })

    res.json({ total, byFriend })
  } catch (error) {
    next(error)
  }
}

export async function markRead(req, res, next) {
  try {
    const me = req.userId
    const peer = req.params.peerId

    const result = await ChatMessage.updateMany(
      { from: peer, to: me, readAt: null },
      { $set: { readAt: new Date() } },
    )

    res.json({ ok: true, marked: result.modifiedCount || 0 })
  } catch (error) {
    next(error)
  }
}
