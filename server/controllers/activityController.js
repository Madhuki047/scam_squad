import mongoose from 'mongoose'
import ActivityLog from '../models/ActivityLog.js'

// GET /api/activity?limit=20 - the signed-in player's recent activity.
// Newest first; limit clamped to [1, 50].
export async function listActivity(req, res, next) {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20))
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const items = await ActivityLog.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
    const weekly = await ActivityLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          createdAt: { $gte: lastWeek },
          points: { $gt: 0 },
        },
      },
      { $group: { _id: null, total: { $sum: '$points' } } },
    ])
    res.json({ items, pointsLastWeek: weekly[0]?.total || 0 })
  } catch (error) {
    next(error)
  }
}
