import { Router } from 'express'
import protect from '../middleware/auth.js'
import { getHistory } from '../controllers/chatController.js'

// Chat REST routes, mounted at /api/chat. The realtime delivery side of
// chat lives in services/chatSocket.js.
const router = Router()

router.get('/:peerId', protect, getHistory)

export default router
