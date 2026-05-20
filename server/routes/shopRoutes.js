import { Router } from 'express'
import protect from '../middleware/auth.js'
import { getCatalog, buyItem } from '../controllers/shopController.js'

// Shop routes, mounted at /api/shop in index.js.
const router = Router()

router.get('/', protect, getCatalog)
router.post('/buy/:itemId', protect, buyItem)

export default router
