import User from '../models/User.js'
import {
  applyRegen,
  getNextRegenAt,
  useLife,
  MAX_LIVES,
  REGEN_INTERVAL_MS,
} from '../services/livesService.js'
import { logActivity } from '../services/activityService.js'

const CASE_REWARDS = {
  rookie: 300,
  veteran: 500,
}

const VALID_BADGES = new Set([
  'sharp-eyes',
  'hooked-once',
  'burned-twice',
  'pattern-recognition-beginner',
  'digital-defender-level-2',
  'human-firewall-beginner',
  'human-firewall',
  'network-navigator',
  'eyes-open-beginner',
  'the-mirage-broken',
])

function fullCaseCount(completedCases = []) {
  const byCase = new Map()
  completedCases.forEach((entry) => {
    if (!byCase.has(entry.caseId)) byCase.set(entry.caseId, new Set())
    byCase.get(entry.caseId).add(entry.difficulty)
  })
  return [...byCase.values()].filter(
    (difficulties) => difficulties.has('rookie') && difficulties.has('veteran'),
  ).length
}

function safeUser(user) {
  const obj = user.toObject()
  delete obj.password
  return obj
}

function completionKey(caseId, difficulty) {
  return `${caseId}:${difficulty}`
}

function progressPayload(user) {
  const points = user.points ?? user.totalScore ?? 0
  return {
    livesRemaining: user.livesRemaining,
    maxLives: MAX_LIVES,
    lastLifeRegen: user.lastLifeRegen,
    nextRegenAt: getNextRegenAt(user),
    regenIntervalMs: REGEN_INTERVAL_MS,
    points,
    totalScore: points,
    completedCases: user.completedCases || [],
    badges: user.badges || [],
    casesSolved: fullCaseCount(user.completedCases),
    introCompleted: Boolean(user.introCompleted),
  }
}

export async function getProgress(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'Account not found.' })

    if (applyRegen(user)) await user.save()
    res.json({ user: safeUser(user), progress: progressPayload(user) })
  } catch (error) {
    next(error)
  }
}

export async function completeCase(req, res, next) {
  try {
    const { caseId, difficulty, badge, result, bonusPoints = 0 } = req.body
    const numericCaseId = Number(caseId)
    const numericBonusPoints = Number(bonusPoints)

    if (!Number.isInteger(numericCaseId) || numericCaseId < 1) {
      return res.status(400).json({ message: 'caseId must be a positive integer.' })
    }
    if (!CASE_REWARDS[difficulty]) {
      return res.status(400).json({ message: 'difficulty must be rookie or veteran.' })
    }
    if (result !== 'success') {
      return res
        .status(400)
        .json({ message: 'Only successful case outcomes can be completed.' })
    }
    if (badge?.id && !VALID_BADGES.has(badge.id)) {
      return res.status(400).json({ message: 'Unknown badge.' })
    }
    if (
      !Number.isInteger(numericBonusPoints) ||
      numericBonusPoints < 0 ||
      numericBonusPoints > 100
    ) {
      return res.status(400).json({ message: 'bonusPoints must be an integer from 0 to 100.' })
    }

    const existingUser = await User.findById(req.userId)
    if (!existingUser) return res.status(404).json({ message: 'Account not found.' })
    if (
      difficulty === 'veteran' &&
      !existingUser.completedCases.some(
        (entry) => entry.caseId === numericCaseId && entry.difficulty === 'rookie',
      )
    ) {
      return res.status(409).json({ message: 'Complete Rookie before Veteran.' })
    }

    const key = completionKey(numericCaseId, difficulty)
    const reward = CASE_REWARDS[difficulty] + numericBonusPoints
    let alreadyComplete = false
    let pointsAwarded = reward
    let user = await User.findOneAndUpdate(
      {
        _id: req.userId,
        completedCases: {
          $not: {
            $elemMatch: {
              caseId: numericCaseId,
              difficulty,
            },
          },
        },
      },
      {
        $push: {
          completedCases: {
            caseId: numericCaseId,
            difficulty,
            pointsAwarded: reward,
          },
        },
        $inc: {
          points: reward,
          totalScore: reward,
        },
      },
      { new: true, runValidators: true },
    )

    if (!user) {
      user = await User.findById(req.userId)
      if (!user) return res.status(404).json({ message: 'Account not found.' })
      alreadyComplete = user.completedCases.some(
        (entry) => completionKey(entry.caseId, entry.difficulty) === key,
      )
      pointsAwarded = alreadyComplete ? 0 : reward
    }

    applyRegen(user)
    user.casesSolved = fullCaseCount(user.completedCases)

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
      progress: progressPayload(user),
      pointsAwarded,
      alreadyComplete,
    })
  } catch (error) {
    next(error)
  }
}

export async function completeIntro(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'Account not found.' })

    if (!user.introCompleted) {
      user.introCompleted = true
      await user.save()
    }

    res.json({
      user: safeUser(user),
      progress: progressPayload(user),
      introCompleted: true,
    })
  } catch (error) {
    next(error)
  }
}

export async function failAttempt(req, res, next) {
  try {
    const { caseId, difficulty } = req.body
    const numericCaseId = Number(caseId)

    if (!Number.isInteger(numericCaseId) || numericCaseId < 1) {
      return res.status(400).json({ message: 'caseId must be a positive integer.' })
    }
    if (difficulty && !CASE_REWARDS[difficulty]) {
      return res.status(400).json({ message: 'difficulty must be rookie or veteran.' })
    }

    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'Account not found.' })

    const remaining = useLife(user)
    if (remaining === null) {
      return res.status(409).json({
        message: 'No lives remaining.',
        user: safeUser(user),
        progress: progressPayload(user),
      })
    }

    await user.save()
    await logActivity(
      req.userId,
      'life',
      `Failed Case ${String(numericCaseId).padStart(2, '0')}${
        difficulty ? ` ${difficulty}` : ''
      } attempt`,
      0,
    )

    res.json({
      user: safeUser(user),
      progress: progressPayload(user),
      lifeLost: 1,
    })
  } catch (error) {
    next(error)
  }
}
