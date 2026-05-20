import { Router } from 'express'
import protect from '../middleware/auth.js'
import {
  listFriends,
  listRequests,
  searchPlayers,
  sendRequest,
  acceptRequest,
  declineRequest,
  removeFriend,
} from '../controllers/friendsController.js'

// Friends routes, mounted at /api/friends in index.js. Listed in
// most-specific-first order so the static paths win over the `:userId`
// captures.
const router = Router()

router.get('/', protect, listFriends)
router.get('/requests', protect, listRequests)
router.get('/search', protect, searchPlayers)

router.post('/request/:userId', protect, sendRequest)
router.post('/accept/:userId', protect, acceptRequest)
router.post('/decline/:userId', protect, declineRequest)
router.delete('/:userId', protect, removeFriend)

export default router
