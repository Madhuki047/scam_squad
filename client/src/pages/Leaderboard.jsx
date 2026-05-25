import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

const PAGE_SIZE = 20

// Global ranking by total coins. Highlights the signed-in player wherever
// they appear in the page; if they're on a later page, the panel below
// the table shows their actual rank so they always see how they're doing.
export default function Leaderboard() {
  const { token, user } = useAuth()

  const [items, setItems] = useState(null)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [myRank, setMyRank] = useState(null)
  const [error, setError] = useState('')

  // Fetch the visible page.
  useEffect(() => {
    let cancelled = false
    setError('')
    api
      .getLeaderboard(token, { limit: PAGE_SIZE, offset })
      .then((data) => {
        if (cancelled) return
        setItems(data.items)
        setTotal(data.total)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [token, offset])

  // Fetch the signed-in player's true rank once on mount.
  useEffect(() => {
    let cancelled = false
    api
      .getMyRank(token)
      .then((data) => {
        if (!cancelled) setMyRank(data)
      })
      .catch(() => {
        if (!cancelled) setMyRank(null)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="ss-card p-5">
        <h2 className="font-pixel text-sw-cyan text-glow text-base mb-1">
          GLOBAL RANKING
        </h2>
        <p className="text-sw-text3">
          Sorted by total coins. Ties broken by earliest sign-up.
        </p>
      </div>

      {error && (
        <div className="ss-card p-5 text-sw-red text-center">{error}</div>
      )}

      <div className="ss-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr
              className="text-sw-text3 text-sm"
              style={{ borderBottom: '1px solid var(--line)' }}
            >
              <th className="px-4 py-3">RANK</th>
              <th className="px-4 py-3">AGENT</th>
              <th className="px-4 py-3 text-right">LVL</th>
              <th className="px-4 py-3 text-right">CASES</th>
              <th className="px-4 py-3 text-right">COINS</th>
            </tr>
          </thead>
          <tbody>
            {items === null ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-sw-text3">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-sw-text3">
                  No agents on record yet.
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const isMe = user && row._id === user._id
                return (
                  <tr
                    key={row._id}
                    style={{
                      borderBottom: '1px solid var(--line)',
                      background: isMe ? 'rgba(255,78,201,.08)' : 'transparent',
                    }}
                  >
                    <td className="px-4 py-3 font-pixel text-sw-yellow text-sm">
                      #{row.rank}
                    </td>
                    <td className="px-4 py-3">
                      <span className={isMe ? 'text-sw-pink' : 'text-sw-text'}>
                        {row.username}
                      </span>
                      {isMe && (
                        <span className="text-sw-text3 text-sm ml-2">(you)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sw-text2">
                      {row.level}
                    </td>
                    <td className="px-4 py-3 text-right text-sw-text2">
                      {row.casesSolved}
                    </td>
                    <td className="px-4 py-3 text-right font-pixel text-sw-cyan text-sm">
                      {row.points ?? row.totalScore ?? 0}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* "You are #N" panel - shown when the player isn't on the current page. */}
      {myRank && items && !items.some((row) => user && row._id === user._id) && (
        <div className="ss-card p-4 text-center">
          <span className="text-sw-text2">Your position: </span>
          <span className="font-pixel text-sw-pink text-sm">
            #{myRank.rank}
          </span>
          <span className="text-sw-text3 ml-2">
            ({myRank.points ?? myRank.totalScore ?? 0} coins)
          </span>
        </div>
      )}

      {/* Pagination. */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sw-text3">
          <button
            type="button"
            className="ss-btn ss-btn-cyan"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="ss-btn ss-btn-cyan"
            disabled={offset + PAGE_SIZE >= total}
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
