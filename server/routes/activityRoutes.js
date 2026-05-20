import { Router } from 'express'
import protect from '../middleware/auth.js'
import { listActivity } from '../controllers/activityController.js'

// Activity feed, mounted at /api/activity in index.js.
const router = Router()

router.get('/', protect, listActivity)

export default router
