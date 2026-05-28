import User from '../models/User.js'

// Public projection used for every leaderboard row.
const PROJECTION = 'username points totalScore casesSolved level accuracy'

// GET /api/leaderboard?limit=N&offset=N
// Ranks every player by coins/points (then earliest createdAt as a stable
// tie-break). Limit is clamped to [1, 50]; offset must be >= 0. The rank
// position is computed live from the offset so the result is correct
// regardless of the cached `user.rank` field.
export async function getLeaderboard(req, res, next) {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20))
    const offset = Math.max(0, Number(req.query.offset) || 0)

    const total = await User.countDocuments()
    const players = await User.find()
      .select(PROJECTION)
      .sort({ points: -1, createdAt: 1 })
      .skip(offset)
      .limit(limit)

    const items = players.map((p, i) => {
      const coins = p.points ?? p.totalScore ?? 0
      return {
        _id: p._id,
        username: p.username,
        points: coins,
        totalScore: coins,
        casesSolved: p.casesSolved || 0,
        level: p.level || 1,
        accuracy: p.accuracy || 0,
        rank: offset + i + 1,
      }
    })

    res.json({ items, total, limit, offset })
  } catch (error) {
    next(error)
  }
}

// GET /api/leaderboard/me
// Returns the signed-in player's current rank position. Computed as
// (number of players with a strictly higher score) + 1, so ties share
// the better rank.
export async function getMyRank(req, res, next) {
  try {
    const me = await User.findById(req.userId).select('points totalScore')
    if (!me) return res.status(404).json({ message: 'Account not found.' })

    const coins = me.points ?? me.totalScore ?? 0
    const ahead = await User.countDocuments({
      points: { $gt: coins },
    })
    res.json({ rank: ahead + 1, points: coins, totalScore: coins })
  } catch (error) {
    next(error)
  }
}
