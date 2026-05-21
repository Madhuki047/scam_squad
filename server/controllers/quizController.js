import mongoose from 'mongoose'
import QuizQuestion from '../models/QuizQuestion.js'
import User from '../models/User.js'
import {
  getSession,
  saveSession,
  clearSession,
} from '../services/quizSessionStore.js'
import { applyRegen, grantLife } from '../services/livesService.js'
import { logActivity } from '../services/activityService.js'

// --- session shape ---------------------------------------------------
// {
//   level: 'easy' | 'medium' | 'hard',
//   streak: number,             // + = correct streak, - = wrong streak
//   shown: [questionIdStr, ...] // every question issued this session
//   current: { questionId, correctIndex } | null  // the unanswered one
//   correctCount, answered    // running tallies
// }

const SESSION_LENGTH = 5
const LIFE_THRESHOLD = 4 // 4/5 correct -> +1 life
const LEVELS = ['easy', 'medium', 'hard']

function levelUp(level) {
  const i = LEVELS.indexOf(level)
  return i < LEVELS.length - 1 ? LEVELS[i + 1] : level
}
function levelDown(level) {
  const i = LEVELS.indexOf(level)
  return i > 0 ? LEVELS[i - 1] : level
}

function freshSession() {
  return {
    level: 'easy',
    streak: 0,
    shown: [],
    current: null,
    correctCount: 0,
    answered: 0,
  }
}

// GET /api/quiz/next - returns the next question and creates the session
// on first call. Refuses to serve a 6th question - the client should
// call /complete once `progress.answered === total`.
export async function nextQuestion(req, res, next) {
  try {
    let session = (await getSession(req.userId)) || freshSession()

    if (session.answered >= SESSION_LENGTH) {
      return res.status(400).json({
        message: 'Quiz finished. Call /api/quiz/complete to finalise.',
      })
    }
    if (session.current) {
      return res.status(400).json({
        message: 'A question is already in progress. Submit an answer first.',
      })
    }

    // Random question at the current level, excluding everything already
    // shown this session.
    const excludeIds = session.shown.map(
      (id) => new mongoose.Types.ObjectId(id),
    )
    const picked = await QuizQuestion.aggregate([
      { $match: { difficulty: session.level, _id: { $nin: excludeIds } } },
      { $sample: { size: 1 } },
    ])
    if (!picked.length) {
      return res.status(404).json({
        message: `No more questions at level ${session.level}.`,
      })
    }

    const q = picked[0]
    session.current = {
      questionId: String(q._id),
      correctIndex: q.correctIndex,
    }
    session.shown.push(String(q._id))
    await saveSession(req.userId, session)

    // Note the correct index is NOT sent to the client.
    res.json({
      question: {
        id: q._id,
        text: q.question,
        options: q.options,
        category: q.category,
        difficulty: q.difficulty,
      },
      level: session.level,
      progress: {
        answered: session.answered,
        correct: session.correctCount,
        total: SESSION_LENGTH,
      },
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/quiz/answer  body: { answerIndex }
// Validates the answer, updates streak + level for the NEXT question,
// returns the truth (correct/incorrect + correctIndex) so the UI can
// teach.
//
// PHASE 6: rate-limit to max 1 / 2 seconds / user.
export async function answerQuestion(req, res, next) {
  try {
    const { answerIndex } = req.body
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
      return res
        .status(400)
        .json({ message: 'answerIndex must be an integer 0-3.' })
    }

    const session = await getSession(req.userId)
    if (!session || !session.current) {
      return res.status(400).json({
        message: 'No question in progress. Call /api/quiz/next first.',
      })
    }

    const correctIndex = session.current.correctIndex
    const isCorrect = answerIndex === correctIndex

    // Streak + adaptive difficulty: 2 correct in a row -> level up;
    // 2 wrong in a row -> level down. Streak resets on a level change.
    if (isCorrect) {
      session.streak = session.streak >= 0 ? session.streak + 1 : 1
      session.correctCount += 1
      if (session.streak >= 2) {
        const nextLevel = levelUp(session.level)
        if (nextLevel !== session.level) {
          session.level = nextLevel
          session.streak = 0
        }
      }
    } else {
      session.streak = session.streak <= 0 ? session.streak - 1 : -1
      if (session.streak <= -2) {
        const nextLevel = levelDown(session.level)
        if (nextLevel !== session.level) {
          session.level = nextLevel
          session.streak = 0
        }
      }
    }

    session.answered += 1
    session.current = null
    await saveSession(req.userId, session)

    res.json({
      correct: isCorrect,
      correctIndex,
      nextLevel: session.level,
      progress: {
        answered: session.answered,
        correct: session.correctCount,
        total: SESSION_LENGTH,
      },
      finished: session.answered >= SESSION_LENGTH,
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/quiz/reset - abandon any in-progress session so the player
// can start a fresh quiz. Safe to call when no session exists; this is
// how the client recovers from a question left mid-flight (e.g. the
// player navigated away before answering).
export async function resetSession(req, res, next) {
  try {
    await clearSession(req.userId)
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}

// POST /api/quiz/complete - tally the session, award a life if the
// player got >= 4/5, log it, and clear the session.
export async function completeQuiz(req, res, next) {
  try {
    const session = await getSession(req.userId)
    if (!session) {
      return res.status(400).json({ message: 'No quiz session to complete.' })
    }
    if (session.answered < SESSION_LENGTH) {
      return res.status(400).json({
        message: 'Quiz session not finished yet.',
      })
    }

    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'Account not found.' })
    applyRegen(user)

    let awardedLife = false
    if (session.correctCount >= LIFE_THRESHOLD) {
      awardedLife = grantLife(user)
    }
    await user.save()

    const summary = `Quiz: ${session.correctCount}/${SESSION_LENGTH}${
      awardedLife ? ' (+1 life)' : ''
    }`
    await logActivity(req.userId, 'quiz', summary, 0)
    await clearSession(req.userId)

    res.json({
      correctCount: session.correctCount,
      total: SESSION_LENGTH,
      awardedLife,
      newLives: user.livesRemaining,
    })
  } catch (error) {
    next(error)
  }
}
