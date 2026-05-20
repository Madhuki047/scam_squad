import { Router } from 'express'
import protect from '../middleware/auth.js'
import { rateLimit } from '../middleware/rateLimit.js'
import { getLives, spendLife } from '../controllers/livesController.js'

// Lives routes, mounted at /api/lives in index.js.
const router = Router()

router.get('/', protect, getLives)

// Anti-cheat: a real player can lose at most a few lives a minute.
// Three is generous; anything beyond that is almost certainly a script
// trying to drain or churn the cooldown.
router.post(
  '/use',
  protect,
  rateLimit({ id: 'lives.use', windowMs: 60_000, max: 3 }),
  spendLife,
)

export default router
