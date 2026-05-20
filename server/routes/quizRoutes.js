import { Router } from 'express'
import protect from '../middleware/auth.js'
import { rateLimit } from '../middleware/rateLimit.js'
import {
  nextQuestion,
  answerQuestion,
  completeQuiz,
} from '../controllers/quizController.js'

// Quiz routes, mounted at /api/quiz in index.js.
const router = Router()

router.get('/next', protect, nextQuestion)

// Anti-cheat: one answer every two seconds is faster than a human can
// read a question. Anything beyond that is a bot trying to brute-force
// the quiz.
router.post(
  '/answer',
  protect,
  rateLimit({ id: 'quiz.answer', windowMs: 2_000, max: 1 }),
  answerQuestion,
)

router.post('/complete', protect, completeQuiz)

export default router
