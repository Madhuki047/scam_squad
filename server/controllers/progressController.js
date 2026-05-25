import User from '../models/User.js'
import { applyRegen } from '../services/livesService.js'
import { logActivity } from '../services/activityService.js'

const CASE_REWARDS = {
  rookie: 300,
  veteran: 500,
}

function safeUser(user) {
  const obj = user.toObject()
  delete obj.password
  return obj
}

function completionKey(caseId, difficulty) {
  return `${caseId}:${difficulty}`
}

export async function completeCase(req, res, next) {
  try {
    const { caseId, difficulty, badge } = req.body
    const numericCaseId = Number(caseId)

    if (!Number.isInteger(numericCaseId) || numericCaseId < 1) {
      return res.status(400).json({ message: 'caseId must be a positive integer.' })
    }
    if (!CASE_REWARDS[difficulty]) {
      return res.status(400).json({ message: 'difficulty must be rookie or veteran.' })
    }

    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'Account not found.' })

    applyRegen(user)

    if (!user.completedCases) user.completedCases = []
    const completed = user.completedCases
    const key = completionKey(numericCaseId, difficulty)
    const alreadyComplete = completed.some(
      (entry) => completionKey(entry.caseId, entry.difficulty) === key,
    )

    const pointsAwarded = alreadyComplete ? 0 : CASE_REWARDS[difficulty]
    if (!alreadyComplete) {
      user.completedCases.push({
        caseId: numericCaseId,
        difficulty,
        pointsAwarded,
      })
      user.points += pointsAwarded
      user.totalScore += pointsAwarded
      user.casesSolved = new Set(user.completedCases.map((entry) => entry.caseId)).size
    }

    if (badge && !user.badges.some((entry) => entry.id === badge.id)) {
      user.badges.push({ id: badge.id })
    }

    await user.save()

    if (!alreadyComplete) {
      await logActivity(
        req.userId,
        'case',
        `Completed Case ${String(numericCaseId).padStart(2, '0')} ${difficulty}`,
        pointsAwarded,
      )
    }

    res.json({
      user: safeUser(user),
      pointsAwarded,
      alreadyComplete,
    })
  } catch (error) {
    next(error)
  }
}
