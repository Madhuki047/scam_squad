import User from '../models/User.js'

// How many players the board shows. Tunable.
const TOP_N = 20

// GET /api/leaderboard
// Ranks players by lifetime xp. xp is the right key because it only ever
// grows (case completions add it) - unlike `points`, which is spendable
// currency in the shop and would make a player's rank drop when they buy
// something. Also returns the signed-in player's own standing so the UI
// can highlight them even when they fall outside the top N.
export async function getLeaderboard(req, res, next) {
  try {
    const top = await User.find()
      .sort({ xp: -1, createdAt: 1 })
      .limit(TOP_N)
      .select('username xp casesSolved level')

    const entries = top.map((u, i) => ({
      rank: i + 1,
      id: u._id,
      username: u.username,
      xp: u.xp || 0,
      casesSolved: u.casesSolved || 0,
      level: u.level || 1,
    }))

    // The signed-in player's rank, computed to match the list's exact sort
    // order (xp desc, then older accounts first) so a player's `you.rank`
    // never disagrees with the rank shown on their row in `entries`.
    const me = await User.findById(req.userId).select(
      'username xp casesSolved level createdAt',
    )
    let you = null
    if (me) {
      const myXp = me.xp || 0
      const ahead = await User.countDocuments({
        $or: [
          { xp: { $gt: myXp } },
          { xp: myXp, createdAt: { $lt: me.createdAt } },
        ],
      })
      you = {
        rank: ahead + 1,
        id: me._id,
        username: me.username,
        xp: me.xp || 0,
        casesSolved: me.casesSolved || 0,
        level: me.level || 1,
      }
    }

    res.json({ entries, you })
  } catch (error) {
    next(error)
  }
}
