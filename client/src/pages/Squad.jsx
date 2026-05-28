import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import ChatPanel from '../components/ChatPanel.jsx'
import { useSocialNotifications } from '../context/SocialNotificationsContext.jsx'

// Squad screen: the signed-in player's friends, incoming requests, and a
// search box for sending new requests. Clicking Chat on a friend opens a
// real-time chat panel anchored to the bottom-right.
export default function Squad() {
  const { token } = useAuth()
  const {
    unreadByFriend,
    markChatRead,
    refresh: refreshNotifications,
  } = useSocialNotifications()

  const [friends, setFriends] = useState(null)
  const [requests, setRequests] = useState(null)
  const [outgoing, setOutgoing] = useState(null)
  const [error, setError] = useState('')
  const [activeChat, setActiveChat] = useState(null)

  // Pulls both lists. Re-used after every mutating action so the UI stays
  // in sync without hand-rolling optimistic updates.
  const refresh = useCallback(async () => {
    try {
      const [a, b, c] = await Promise.all([
        api.getFriends(token),
        api.getFriendRequests(token),
        api.getOutgoingFriendRequests(token),
      ])
      setFriends(a.items)
      setRequests(b.items)
      setOutgoing(c.items)
      refreshNotifications().catch(() => {})
    } catch (err) {
      setError(err.message)
    }
  }, [token, refreshNotifications])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleAccept(userId) {
    await api.acceptFriendRequest(token, userId)
    refresh()
  }
  async function handleDecline(userId) {
    await api.declineFriendRequest(token, userId)
    refresh()
  }
  async function handleRemove(userId) {
    await api.removeFriend(token, userId)
    refresh()
  }
  function openChat(player) {
    setActiveChat(player)
    markChatRead(player._id).catch(() => {})
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {error && (
        <div className="ss-card p-4 text-sw-red text-center">{error}</div>
      )}

      <AddFriendCard token={token} onChange={refresh} />

      <Section title={`INCOMING REQUESTS — ${requests?.length ?? 0}`}>
        {requests === null ? (
          <p className="text-sw-text3">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="text-sw-text3">No pending requests right now.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {requests.map((p) => (
              <li
                key={p._id}
                className="flex items-center justify-between gap-3"
                style={{ borderBottom: '1px solid var(--line)', paddingBottom: 8 }}
              >
                <PlayerLine player={p} />
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    className="ss-btn ss-btn-cyan"
                    onClick={() => handleAccept(p._id)}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="ss-btn ss-btn-red"
                    onClick={() => handleDecline(p._id)}
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`OUTGOING REQUESTS — ${outgoing?.length ?? 0}`}>
        {outgoing === null ? (
          <p className="text-sw-text3">Loading…</p>
        ) : outgoing.length === 0 ? (
          <p className="text-sw-text3">No sent requests waiting right now.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {outgoing.map((p) => (
              <li
                key={p._id}
                className="flex items-center justify-between gap-3"
                style={{ borderBottom: '1px solid var(--line)', paddingBottom: 8 }}
              >
                <PlayerLine player={p} />
                <span className="text-sw-text3 text-sm shrink-0">Pending</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`MY SQUAD — ${friends?.length ?? 0}`}>
        {friends === null ? (
          <p className="text-sw-text3">Loading…</p>
        ) : friends.length === 0 ? (
          <p className="text-sw-text3">
            No squad members yet. Use the search above to add an agent.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {friends.map((p) => {
              const unreadCount = unreadByFriend[String(p._id)] || 0
              return (
                <li
                  key={p._id}
                  className="flex items-center justify-between gap-3"
                  style={{ borderBottom: '1px solid var(--line)', paddingBottom: 8 }}
                >
                  <PlayerLine player={p} unreadCount={unreadCount} />
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      className="ss-btn ss-btn-cyan"
                      onClick={() => openChat(p)}
                    >
                      Chat
                      {unreadCount > 0 && (
                        <span className="social-inline-badge ml-2">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      className="ss-btn ss-btn-red"
                      onClick={() => handleRemove(p._id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Section>

      {activeChat && (
        <ChatPanel peer={activeChat} onClose={() => setActiveChat(null)} />
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="ss-card p-5">
      <h3 className="font-pixel text-sw-pink text-sm mb-4">{title}</h3>
      {children}
    </div>
  )
}

function PlayerLine({ player, unreadCount = 0 }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div
        className="shrink-0 rounded"
        style={{
          width: 36,
          height: 36,
          background: 'var(--violet)',
          boxShadow: '0 0 8px var(--violet)',
        }}
      />
      <div className="min-w-0">
        <div className="text-sw-text truncate flex items-center gap-2">
          {player.username}
          {unreadCount > 0 && (
            <span className="social-inline-badge">{unreadCount}</span>
          )}
        </div>
        <div className="text-sw-text3 text-sm">
          Lvl {player.level || 1} · {player.totalScore || 0} score
        </div>
      </div>
    </div>
  )
}

// Search-by-prefix card. Results are de-duplicated against the player's
// own friends + pending list on the server, so every match shows an
// actionable Add button.
function AddFriendCard({ token, onChange }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Debounced search: only fires after the user pauses typing.
  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    const handle = setTimeout(async () => {
      try {
        const data = await api.searchPlayers(token, q.trim())
        setResults(data.items)
      } catch (err) {
        setError(err.message)
      }
    }, 250)
    return () => clearTimeout(handle)
  }, [q, token])

  async function handleAdd(userId) {
    setBusy(true)
    setError('')
    try {
      await api.sendFriendRequest(token, userId)
      // Drop the just-added row immediately; the server will exclude them
      // from future searches as well.
      setResults((rows) => rows.filter((r) => r._id !== userId))
      onChange?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ss-card p-5">
      <h3 className="font-pixel text-sw-pink text-sm mb-4">ADD AGENT</h3>
      <input
        className="ss-input"
        placeholder="Search by code name"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {error && <p className="text-sw-red mt-2">{error}</p>}
      {results.length > 0 && (
        <ul className="flex flex-col gap-3 mt-4">
          {results.map((p) => (
            <li
              key={p._id}
              className="flex items-center justify-between gap-3"
            >
              <PlayerLine player={p} />
              <button
                type="button"
                className="ss-btn ss-btn-cyan shrink-0"
                disabled={busy}
                onClick={() => handleAdd(p._id)}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
