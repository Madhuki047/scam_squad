import { Router } from 'express'
import protect from '../middleware/auth.js'
import { completeCase, getProgress } from '../controllers/casesController.js'

// Case routes, mounted at /api/cases. The cases themselves are scripted
// scene graphs that run client-side; the server only records the result.
const router = Router()

router.get('/progress', protect, getProgress)
router.post('/:caseId/complete', protect, completeCase)

export default router
