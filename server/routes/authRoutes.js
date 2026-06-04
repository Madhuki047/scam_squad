import { Router } from 'express'
import {
  register,
  login,
  verifyOtp,
  resendOtp,
  logout,
} from '../controllers/authController.js'

// Authentication routes, mounted at /api/auth in index.js.
const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/verify-otp', verifyOtp) // second step of 2FA sign-in
router.post('/resend-otp', resendOtp)
router.post('/logout', logout)

export default router
