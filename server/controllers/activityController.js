import ActivityLog from '../models/ActivityLog.js'

// GET /api/activity?limit=20 - the signed-in player's recent activity.
// Newest first; limit clamped to [1, 50].
export async function listActivity(req, res, next) {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20))
    const items = await ActivityLog.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
    res.json({ items })
  } catch (error) {
    next(error)
  }
}
