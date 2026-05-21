import { Router } from 'express'
import protect from '../middleware/auth.js'
import {
  listFriends,
  searchUsers,
  sendRequest,
  acceptRequest,
  declineRequest,
  removeFriend,
} from '../controllers/friendsController.js'

// Friends/squad routes, mounted at /api/friends in index.js.
// /search is declared before the /:id routes so it isn't shadowed.
const router = Router()

router.get('/', protect, listFriends)
router.get('/search', protect, searchUsers)
router.post('/request/:id', protect, sendRequest)
router.post('/accept/:id', protect, acceptRequest)
router.post('/decline/:id', protect, declineRequest)
router.post('/remove/:id', protect, removeFriend)

export default router
