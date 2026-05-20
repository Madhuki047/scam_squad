import { Router } from 'express'
import protect from '../middleware/auth.js'
import { getLives, spendLife } from '../controllers/livesController.js'

// Lives routes, mounted at /api/lives in index.js.
const router = Router()

router.get('/', protect, getLives)
router.post('/use', protect, spendLife)

export default router
