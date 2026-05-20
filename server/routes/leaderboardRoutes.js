import { Router } from 'express'
import protect from '../middleware/auth.js'
import {
  getLeaderboard,
  getMyRank,
} from '../controllers/leaderboardController.js'

// Leaderboard routes, mounted at /api/leaderboard in index.js.
const router = Router()

// Public ranking (still requires a login so casual scraping isn't free).
router.get('/', protect, getLeaderboard)

// Declared AFTER '/' so "me" is captured by getMyRank, not getLeaderboard.
router.get('/me', protect, getMyRank)

export default router
