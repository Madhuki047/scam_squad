import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { createSocket } from '../services/socket.js'
import { useSocialNotifications } from '../context/SocialNotificationsContext.jsx'

// 1:1 chat overlay anchored to the bottom-right of the screen. Squad
// opens one of these per active conversation. Closing it disconnects
// the socket so an idle player doesn't hold a long-lived connection.
export default function ChatPanel({ peer, onClose }) {
  const { token, user } = useAuth()
  const { markChatRead } = useSocialNotifications()
  const [messages, setMessages] = useState(null)
  const [draft, setDraft] = useState('')
  const [peerTyping, setPeerTyping] = useState(false)
  const [error, setError] = useState('')

  const socketRef = useRef(null)
  const scrollRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const ownTypingRef = useRef(0)

  // Connect socket + fetch history.
  useEffect(() => {
    if (!token || !peer?._id) return
    let cancelled = false

    api
      .getChatHistory(token, peer._id)
      .then((data) => {
        if (!cancelled) {
          setMessages(data.items)
          markChatRead(peer._id).catch(() => {})
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })

    const sock = createSocket(token)
    socketRef.current = sock

    sock.on('connect_error', (err) => {
      if (!cancelled) setError(err.message)
    })

    sock.on('chat:message', (msg) => {
      // Only the conversation with this peer concerns this panel.
      if (
        String(msg.from) !== String(peer._id) &&
        String(msg.to) !== String(peer._id)
      ) {
        return
      }
      setMessages((m) => [...(m || []), msg])
      if (String(msg.from) === String(peer._id)) {
        markChatRead(peer._id).catch(() => {})
      }
    })

    sock.on('chat:typing', ({ from }) => {
      if (String(from) !== String(peer._id)) return
      setPeerTyping(true)
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => setPeerTyping(false), 1500)
    })

    return () => {
      cancelled = true
      clearTimeout(typingTimeoutRef.current)
      sock.disconnect()
      socketRef.current = null
    }
  }, [token, peer?._id, markChatRead])

  // Auto-scroll to bottom on new message.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, peerTyping])

  function handleChange(e) {
    setDraft(e.target.value)
    // Throttle typing notifications to one per second.
    const now = Date.now()
    if (now - ownTypingRef.current > 1000) {
      ownTypingRef.current = now
      socketRef.current?.emit('chat:typing', { toUserId: peer._id })
    }
  }

  function handleSend(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setDraft('')
    setError('')

    socketRef.current?.emit(
      'chat:send',
      { toUserId: peer._id, text },
      (ack) => {
        if (ack?.ok) {
          // Server echoes ours back via ack; append it as our own line.
          setMessages((m) => [...(m || []), ack.message])
        } else {
          setError(ack?.message || 'Send failed.')
        }
      },
    )
  }

  return (
    <div
      className="fixed bottom-4 right-4 ss-card flex flex-col"
      style={{ width: 320, height: 420, zIndex: 30 }}
    >
      {/* Header. */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <div className="min-w-0">
          <div className="text-sw-cyan truncate">{peer.username}</div>
          <div className="text-sw-text3 text-xs">
            {peerTyping ? 'typing…' : 'Squad chat'}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sw-text3 hover:text-sw-red px-2"
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      {/* Message list. */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2">
        {messages === null ? (
          <p className="text-sw-text3 text-center mt-4">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-sw-text3 text-center mt-4">
            Say hi — this conversation is empty.
          </p>
        ) : (
          messages.map((m) => {
            const mine = user && String(m.from) === String(user._id)
            return (
              <div
                key={m._id || `${m.from}-${m.createdAt}`}
                className={`flex mb-2 ${mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="px-3 py-1 rounded max-w-[80%] text-sw-text"
                  style={{
                    background: mine
                      ? 'rgba(255,78,201,.18)'
                      : 'rgba(93,213,232,.15)',
                    border: '1px solid var(--line2)',
                  }}
                >
                  {m.text}
                </div>
              </div>
            )
          })
        )}
      </div>

      {error && (
        <div className="px-3 py-1 text-sw-red text-sm text-center">{error}</div>
      )}

      {/* Composer. */}
      <form
        onSubmit={handleSend}
        className="flex gap-2 px-3 py-2"
        style={{ borderTop: '1px solid var(--line)' }}
      >
        <input
          className="ss-input flex-1"
          placeholder="Message"
          value={draft}
          onChange={handleChange}
          maxLength={1000}
        />
        <button type="submit" className="ss-btn ss-btn-cyan">
          Send
        </button>
      </form>
    </div>
  )
}
