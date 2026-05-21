import { Router } from 'express'
import protect from '../middleware/auth.js'
import {
  nextQuestion,
  answerQuestion,
  completeQuiz,
  resetSession,
} from '../controllers/quizController.js'

// Quiz routes, mounted at /api/quiz in index.js.
const router = Router()

router.get('/next', protect, nextQuestion)
router.post('/answer', protect, answerQuestion)
router.post('/complete', protect, completeQuiz)
router.post('/reset', protect, resetSession)

export default router
