import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const MAX_LIVES = 5
const REGEN_INTERVAL_MS = 30 * 60 * 1000 // mirrors server livesService

// "M:SS" countdown (e.g. 29:42). Hours rarely needed - if a player has
// been gone long enough to need them, /me will have already regenerated.
function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

// Top bar for in-app screens: page title, lives + countdown, points,
// username. When the local countdown hits zero, refreshUser() pulls a
// fresh /me which settles regen on the server.
export default function TopNav({ title }) {
  const { user, refreshUser } = useAuth()

  // Re-render every second to update the countdown - only while not full.
  const [, force] = useState(0)
  const lives = user?.livesRemaining ?? 0
  useEffect(() => {
    if (lives >= MAX_LIVES) return
    const id = setInterval(() => force((x) => x + 1), 1000)
    return () => clearInterval(id)
  }, [lives])

  // Compute the next regen target from the server-issued lastLifeRegen
  // (which getMe settles whenever it serves).
  const lastRegen = user?.lastLifeRegen
    ? new Date(user.lastLifeRegen).getTime()
    : Date.now()
  const nextRegenAt = lives < MAX_LIVES ? lastRegen + REGEN_INTERVAL_MS : null
  const remaining = nextRegenAt ? nextRegenAt - Date.now() : 0
  const expired = nextRegenAt !== null && remaining <= 0

  // When the countdown crosses zero, re-fetch /me so the server settles
  // any owed regen and TopNav picks up the new count.
  useEffect(() => {
    if (expired) refreshUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired])

  return (
    <header
      className="flex items-center justify-between px-6 py-3 gap-4"
      style={{ borderBottom: '1.5px solid var(--line)' }}
    >
      <h1 className="font-pixel text-sw-cyan text-xs md:text-sm">{title}</h1>

      <div className="flex items-center gap-4 md:gap-6 text-lg">
        {/* Lives as filled / empty hearts, with a countdown when not full. */}
        <span
          className="flex items-center gap-2"
          title={`${lives} / ${MAX_LIVES} lives`}
        >
          <span>
            {Array.from({ length: MAX_LIVES }, (_, i) => (
              <span
                key={i}
                className={i < lives ? 'text-sw-red' : 'text-sw-text3'}
              >
                {'♥'}
              </span>
            ))}
          </span>
          {nextRegenAt && (
            <span className="text-sw-text3 text-sm tabular-nums">
              {formatCountdown(remaining)}
            </span>
          )}
        </span>

        <span className="text-sw-yellow">{user?.points ?? 0} PTS</span>

        <span className="text-sw-text2 hidden sm:inline">{user?.username}</span>
      </div>
    </header>
  )
}
