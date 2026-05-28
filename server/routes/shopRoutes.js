import { Router } from 'express'
import protect from '../middleware/auth.js'
import { getShop, buyItem } from '../controllers/shopController.js'

// Shop routes, mounted at /api/shop in index.js.
const router = Router()

router.get('/', protect, getShop)
router.post('/buy/:itemId', protect, buyItem)

export default router
