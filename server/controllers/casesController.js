import User from '../models/User.js'
import { logActivity } from '../services/activityService.js'

// Per-case reward catalog. Locked server-side so the client can't pick
// its own badges or score. Each entry lists the badge ids awarded for
// finishing that case and the points granted on first completion.
const CASE_CATALOG = {
  '1': {
    title: 'The Bait',
    badges: [
      { id: 'hooked-once', name: 'Hooked Once' },
      { id: 'burned-twice', name: 'Burned Twice, Wiser Once' },
    ],
    points: 100,
  },
  '2': {
    title: 'The Network',
    badges: [
      { id: 'empathy-activated', name: 'Empathy Activated' },
      { id: 'digital-defender', name: 'Digital Defender' },
    ],
    points: 100,
  },
  '3': {
    title: 'The Insider',
    badges: [{ id: 'human-firewall', name: 'Human Firewall' }],
    points: 100,
  },
  '4': {
    title: 'The Hotspot',
    badges: [{ id: 'network-navigator', name: 'Network Navigator' }],
    points: 100,
  },
  '5': {
    title: 'The Mirage',
    badges: [
      { id: 'eyes-open', name: 'Eyes Open' },
      { id: 'mirage-broken', name: 'The Mirage Broken' },
    ],
    points: 200,
  },
}

// POST /api/cases/:caseId/complete
// First completion: records the case in user.completedCases, awards the
// catalog badges (skipping any the player already has), grants points
// and bumps casesSolved. Re-completion is idempotent: subsequent calls
// return the same payload but write nothing.
export async function completeCase(req, res, next) {
  try {
    const caseId = String(req.params.caseId)
    const entry = CASE_CATALOG[caseId]
    if (!entry) return res.status(404).json({ message: 'Unknown case.' })

    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'Account not found.' })

    const already = (user.completedCases || []).includes(caseId)
    if (already) {
      return res.json({
        ok: true,
        alreadyCompleted: true,
        badges: entry.badges,
        points: 0,
      })
    }

    user.completedCases = [...(user.completedCases || []), caseId]
    user.casesSolved = (user.casesSolved || 0) + 1
    user.points = (user.points || 0) + entry.points
    user.xp = (user.xp || 0) + entry.points

    const existingIds = new Set((user.badges || []).map((b) => b.id))
    for (const b of entry.badges) {
      if (!existingIds.has(b.id)) {
        user.badges.push({ id: b.id, earnedAt: new Date() })
      }
    }

    await user.save()
    await logActivity(
      req.userId,
      'case',
      `Solved Case ${caseId}: ${entry.title}`,
      entry.points,
    )

    res.json({
      ok: true,
      alreadyCompleted: false,
      badges: entry.badges,
      points: entry.points,
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/cases/progress
// Lightweight snapshot used by the case-select screen: which case ids
// the signed-in player has completed.
export async function getProgress(req, res, next) {
  try {
    const user = await User.findById(req.userId).select(
      'completedCases casesSolved',
    )
    if (!user) return res.status(404).json({ message: 'Account not found.' })
    res.json({
      completed: user.completedCases || [],
      casesSolved: user.casesSolved || 0,
    })
  } catch (error) {
    next(error)
  }
}
