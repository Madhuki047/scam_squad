import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { api } from '../lib/api.js'
import { createSocket } from '../services/socket.js'

const SocialNotificationsContext = createContext(null)

export function SocialNotificationsProvider({ children }) {
  const { token, user } = useAuth()
  const [incomingCount, setIncomingCount] = useState(0)
  const [unreadByFriend, setUnreadByFriend] = useState({})

  const refresh = useCallback(async () => {
    if (!token) return
    const [requests, unread] = await Promise.all([
      api.getFriendRequests(token),
      api.getChatUnreadSummary(token),
    ])
    setIncomingCount(requests.items?.length || 0)
    setUnreadByFriend(unread.byFriend || {})
  }, [token])

  useEffect(() => {
    refresh().catch(() => {})
    const id = window.setInterval(() => {
      refresh().catch(() => {})
    }, 30000)
    return () => window.clearInterval(id)
  }, [refresh])

  useEffect(() => {
    if (!token || !user?._id) return undefined
    const socket = createSocket(token)
    socket.on('chat:message', (msg) => {
      if (String(msg.to) !== String(user._id)) return
      setUnreadByFriend((current) => {
        const from = String(msg.from)
        return { ...current, [from]: (current[from] || 0) + 1 }
      })
    })
    return () => socket.disconnect()
  }, [token, user?._id])

  const markChatRead = useCallback(
    async (peerId) => {
      if (!token || !peerId) return
      await api.markChatRead(token, peerId)
      setUnreadByFriend((current) => {
        const next = { ...current }
        delete next[String(peerId)]
        return next
      })
    },
    [token],
  )

  const totalUnread = useMemo(
    () => Object.values(unreadByFriend).reduce((sum, count) => sum + count, 0),
    [unreadByFriend],
  )

  const value = {
    incomingCount,
    unreadByFriend,
    totalUnread,
    hasNotifications: incomingCount + totalUnread > 0,
    refresh,
    markChatRead,
  }

  return (
    <SocialNotificationsContext.Provider value={value}>
      {children}
    </SocialNotificationsContext.Provider>
  )
}

export function useSocialNotifications() {
  const ctx = useContext(SocialNotificationsContext)
  if (!ctx) {
    throw new Error(
      'useSocialNotifications must be used inside a SocialNotificationsProvider',
    )
  }
  return ctx
}
