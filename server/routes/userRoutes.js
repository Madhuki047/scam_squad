import { Router } from 'express'
import protect from '../middleware/auth.js'
import {
  getMe,
  updateMe,
  deleteMe,
  getUserById,
} from '../controllers/userController.js'
import {
  completeCase,
  failAttempt,
  getProgress,
} from '../controllers/progressController.js'

// User routes, mounted at /api/user in index.js.
const router = Router()

// The signed-in player's own account - all require a valid session.
router.get('/me', protect, getMe)
router.get('/me/progress', protect, getProgress)
router.patch('/me', protect, updateMe)
router.delete('/me', protect, deleteMe)
router.post('/me/complete-case', protect, completeCase)
router.post('/me/fail-attempt', protect, failAttempt)

// Public profile lookup. Declared AFTER /me so the literal "me" is not
// captured as an :id.
router.get('/:id', getUserById)

export default router
