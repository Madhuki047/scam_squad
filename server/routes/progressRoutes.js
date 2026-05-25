import { Router } from 'express'
import protect from '../middleware/auth.js'
import {
  completeCase,
  failAttempt,
  getProgress,
} from '../controllers/progressController.js'

// Progression routes, mounted at /api/progress in index.js.
// These mirror the older /api/user/me/* endpoints but keep game progression
// under an explicit API surface.
const router = Router()

router.get('/', protect, getProgress)
router.post('/complete-case', protect, completeCase)
router.post('/fail-attempt', protect, failAttempt)

export default router
