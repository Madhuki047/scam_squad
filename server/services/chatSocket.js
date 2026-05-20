import jwt from 'jsonwebtoken'
import ChatMessage from '../models/ChatMessage.js'
import User from '../models/User.js'

// Per-userId set of active socket ids. Looking up by userId (rather than
// joining a "user:<id>" room) keeps the implementation visible from a
// single file and avoids relying on socket.io's room lifecycle for
// presence.
const sockets = new Map()

function addSocket(userId, sid) {
  if (!sockets.has(userId)) sockets.set(userId, new Set())
  sockets.get(userId).add(sid)
}

function removeSocket(userId, sid) {
  const set = sockets.get(userId)
  if (!set) return
  set.delete(sid)
  if (set.size === 0) sockets.delete(userId)
}

function emitToUser(io, userId, event, payload) {
  const set = sockets.get(String(userId))
  if (!set) return false
  for (const sid of set) io.to(sid).emit(event, payload)
  return true
}

// Attach chat handlers to an existing Socket.io server. Called once from
// index.js after `new Server(httpServer, ...)`.
export function attachChatSocket(io) {
  // Handshake auth: the client sends the same JWT it uses for REST in
  // socket.handshake.auth.token. Pending (pre-2FA) tokens are rejected.
  io.use((socket, next) => {
    const token = socket.handshake?.auth?.token
    if (!token) return next(new Error('Auth required.'))
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      if (payload.pending) return next(new Error('Two-factor not completed.'))
      socket.userId = String(payload.id)
      next()
    } catch {
      next(new Error('Invalid or expired session.'))
    }
  })

  io.on('connection', (socket) => {
    addSocket(socket.userId, socket.id)

    // chat:send { toUserId, text } -> persist, fan out to recipient,
    // ack the sender so the UI can confirm the delivered timestamp.
    socket.on('chat:send', async ({ toUserId, text }, ack) => {
      try {
        if (!toUserId || typeof text !== 'string' || !text.trim()) {
          return ack?.({ ok: false, message: 'Empty message.' })
        }
        const trimmed = text.trim().slice(0, 1000)

        // Only squad members can chat - enforced server-side so a
        // crafted socket call can't talk to non-friends.
        const me = await User.findById(socket.userId).select('friends')
        const isFriend = me?.friends?.some(
          (id) => String(id) === String(toUserId),
        )
        if (!isFriend) {
          return ack?.({ ok: false, message: 'Only squad members can chat.' })
        }

        const msg = await ChatMessage.create({
          from: socket.userId,
          to: toUserId,
          text: trimmed,
        })
        const payload = {
          _id: msg._id,
          from: socket.userId,
          to: String(toUserId),
          text: trimmed,
          createdAt: msg.createdAt,
        }
        emitToUser(io, toUserId, 'chat:message', payload)
        ack?.({ ok: true, message: payload })
      } catch (error) {
        ack?.({ ok: false, message: error.message })
      }
    })

    // chat:typing { toUserId } -> low-overhead "is typing" indicator.
    // Not persisted; recipient gets a transient event.
    socket.on('chat:typing', ({ toUserId }) => {
      if (!toUserId) return
      emitToUser(io, toUserId, 'chat:typing', { from: socket.userId })
    })

    socket.on('disconnect', () => {
      removeSocket(socket.userId, socket.id)
    })
  })
}
