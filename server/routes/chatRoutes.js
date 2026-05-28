import { Router } from 'express'
import protect from '../middleware/auth.js'
import {
  getHistory,
  getUnreadSummary,
  markRead,
} from '../controllers/chatController.js'

// Chat REST routes, mounted at /api/chat. The realtime delivery side of
// chat lives in services/chatSocket.js.
const router = Router()

router.get('/unread/summary', protect, getUnreadSummary)
router.get('/:peerId', protect, getHistory)
router.post('/:peerId/read', protect, markRead)

export default router
