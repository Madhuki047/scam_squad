import { Router } from 'express'
import { register, login } from '../controllers/authController.js'

// Authentication routes, mounted at /api/auth in index.js.
const router = Router()

router.post('/register', register)
router.post('/login', login)

export default router
