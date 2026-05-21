import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

// Social screen: your squad (friends), incoming requests, and a username
// search to add new agents. Kept deliberately small - no DMs or presence.
export default function Squad() {
  const { token } = useAuth()
  const [friends, setFriends] = useState([])
  const [pending, setPending] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')

  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)

  async function loadFriends() {
    try {
      const d = await api.getFriends(token)
      setFriends(d.friends || [])
      setPending(d.pending || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoaded(true)
    }
  }

  useEffect(() => {
    loadFriends()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function runSearch(e) {
    e?.preventDefault()
    if (q.trim().length < 2) {
      setResults(null)
      return
    }
    setSearching(true)
    setError('')
    try {
      const d = await api.searchFriends(token, q.trim())
      setResults(d.results)
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  // After any mutation, refresh the squad lists and re-run the search (so
  // result statuses update too).
  async function refreshAll() {
    await loadFriends()
    if (q.trim().length >= 2) await runSearch()
  }

  async function act(fn) {
    setError('')
    try {
      await fn()
      await refreshAll()
    } catch (e) {
      setError(e.message)
    }
  }

  const labelForStatus = {
    none: 'Add',
    requested: 'Pending',
    incoming: 'Accept',
    friend: 'Friends',
  }

  function searchAction(r) {
    if (r.status === 'none')
      return act(() => api.sendFriendRequest(token, r.id))
    if (r.status === 'incoming')
      return act(() => api.acceptFriend(token, r.id))
    return undefined // requested / friend -> no-op
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h2 className="font-pixel text-sw-cyan text-glow text-base">SQUAD</h2>
        <p className="text-sw-text3 mt-1">Find agents and build your squad.</p>
      </div>

      {error && <p className="text-sw-red">{error}</p>}

      {/* Search / add. */}
      <div className="ss-card p-5 flex flex-col gap-3">
        <form onSubmit={runSearch} className="flex gap-2">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by username…"
            className="ss-input flex-1"
          />
          <button type="submit" className="ss-btn ss-btn-cyan">
            {searching ? '…' : 'Search'}
          </button>
        </form>

        {results !== null &&
          (results.length === 0 ? (
            <p className="text-sw-text3 text-sm">No agents found.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {results.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 py-1"
                  style={{ borderBottom: '1px solid var(--line)' }}
                >
                  <span className="text-sw-text">
                    {r.username}
                    <span className="text-sw-text3 text-xs ml-2">
                      Lv {r.level}
                    </span>
                  </span>
                  <button
                    type="button"
                    disabled={r.status === 'requested' || r.status === 'friend'}
                    onClick={() => searchAction(r)}
                    className="ss-btn ss-btn-pink text-sm"
                  >
                    {labelForStatus[r.status]}
                  </button>
                </li>
              ))}
            </ul>
          ))}
      </div>

      {/* Incoming requests. */}
      {pending.length > 0 && (
        <div className="ss-card p-5">
          <h3 className="font-pixel text-sw-pink text-sm mb-3">
            REQUESTS — {pending.length}
          </h3>
          <ul className="flex flex-col gap-2">
            {pending.map((p) => (
              <li
                key={p._id}
                className="flex items-center justify-between gap-3 py-1"
                style={{ borderBottom: '1px solid var(--line)' }}
              >
                <span className="text-sw-text">{p.username}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => act(() => api.acceptFriend(token, p._id))}
                    className="ss-btn ss-btn-cyan text-sm"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => act(() => api.declineFriend(token, p._id))}
                    className="ss-btn ss-btn-red text-sm"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Friends list. */}
      <div className="ss-card p-5">
        <h3 className="font-pixel text-sw-pink text-sm mb-3">
          YOUR SQUAD — {friends.length}
        </h3>
        {!loaded ? (
          <p className="text-sw-text3">Loading…</p>
        ) : friends.length === 0 ? (
          <p className="text-sw-text3">
            No squad members yet. Search above to add some.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {friends.map((f) => (
              <li
                key={f._id}
                className="flex items-center justify-between gap-3 py-1"
                style={{ borderBottom: '1px solid var(--line)' }}
              >
                <span className="text-sw-text">
                  {f.username}
                  <span className="text-sw-text3 text-xs ml-2">Lv {f.level}</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sw-yellow text-sm">{f.xp} XP</span>
                  <button
                    type="button"
                    onClick={() => act(() => api.removeFriend(token, f._id))}
                    className="ss-btn ss-btn-red text-sm"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
