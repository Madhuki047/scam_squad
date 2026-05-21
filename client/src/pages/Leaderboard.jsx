import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

// Global rankings. Players are ordered by lifetime XP (server-side); the
// signed-in player's own row is highlighted, and shown at the bottom if
// they fall outside the visible top slice.
export default function Leaderboard() {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .getLeaderboard(token)
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  if (error) {
    return <p className="text-sw-red text-center">{error}</p>
  }
  if (!data) {
    return <p className="text-sw-text3 text-center">Loading…</p>
  }

  const { entries, you } = data
  const youInTop = entries.some((e) => String(e.id) === String(you?.id))

  // Cyan / yellow / pink podium accents for the top three.
  const rankColor = (rank) =>
    rank === 1
      ? 'text-sw-yellow'
      : rank === 2
        ? 'text-sw-cyan'
        : rank === 3
          ? 'text-sw-pink'
          : 'text-sw-text3'

  function Row({ e, highlight }) {
    return (
      <div
        className="grid grid-cols-[3rem_1fr_5rem_5rem] items-center gap-3 px-4 py-3 rounded"
        style={
          highlight
            ? { background: 'rgba(93,213,232,.12)', border: '1px solid var(--cyan)' }
            : { borderBottom: '1px solid var(--line)' }
        }
      >
        <span className={`font-pixel text-sm ${rankColor(e.rank)}`}>
          {e.rank <= 3 ? ['🥇', '🥈', '🥉'][e.rank - 1] : `#${e.rank}`}
        </span>
        <span className="text-sw-text truncate">
          {e.username}
          {highlight && <span className="text-sw-cyan text-xs ml-2">(you)</span>}
        </span>
        <span className="text-sw-yellow text-right">{e.xp}</span>
        <span className="text-sw-text3 text-right">{e.casesSolved}</span>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <div>
        <h2 className="font-pixel text-sw-cyan text-glow text-base">RANKINGS</h2>
        <p className="text-sw-text3 mt-1">Top agents by lifetime XP.</p>
      </div>

      <div className="ss-card p-3">
        {/* Header */}
        <div className="grid grid-cols-[3rem_1fr_5rem_5rem] gap-3 px-4 py-2 text-sw-text3 text-xs uppercase font-pixel">
          <span>Rank</span>
          <span>Agent</span>
          <span className="text-right">XP</span>
          <span className="text-right">Cases</span>
        </div>

        {entries.length === 0 ? (
          <p className="text-sw-text3 text-center py-6">
            No ranked players yet. Solve a case to get on the board.
          </p>
        ) : (
          entries.map((e) => (
            <Row
              key={e.id}
              e={e}
              highlight={String(e.id) === String(you?.id)}
            />
          ))
        )}

        {/* Show the player's own row if they're outside the visible slice. */}
        {you && !youInTop && (
          <>
            <div className="text-center text-sw-text3 py-1">···</div>
            <Row e={you} highlight />
          </>
        )}
      </div>
    </div>
  )
}
