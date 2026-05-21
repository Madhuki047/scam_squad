import { Router } from 'express'
import protect from '../middleware/auth.js'
import { getLeaderboard } from '../controllers/leaderboardController.js'

// Leaderboard routes, mounted at /api/leaderboard in index.js.
const router = Router()

router.get('/', protect, getLeaderboard)

export default router
