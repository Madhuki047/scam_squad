import { Router } from 'express'
import protect from '../middleware/auth.js'
import {
  nextQuestion,
  answerQuestion,
  completeQuiz,
} from '../controllers/quizController.js'

// Quiz routes, mounted at /api/quiz in index.js.
const router = Router()

router.get('/next', protect, nextQuestion)
router.post('/answer', protect, answerQuestion)
router.post('/complete', protect, completeQuiz)

export default router
