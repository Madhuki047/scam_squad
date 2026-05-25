import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { MAX_LIVES } from '../lib/gameRules.js'

// Home screen: welcome heading, the primary "continue case" call to
// action, and a quick stats summary. Rendered inside AppLayout.
export default function Home() {
  const { user } = useAuth()

  const rank = user?.rank > 0 ? `#${user.rank}` : 'Unranked'
  const lives = Math.min(user?.livesRemaining ?? 0, MAX_LIVES)
  const stats = [
    { label: 'LIVES', value: `${lives} / ${MAX_LIVES}`, color: 'text-sw-red' },
    { label: 'POINTS', value: user?.points ?? 0, color: 'text-sw-yellow' },
    { label: 'RANK', value: rank, color: 'text-sw-cyan' },
  ]

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h2 className="font-pixel text-sw-cyan text-glow text-lg md:text-xl">
          WELCOME BACK
        </h2>
        <p className="text-sw-text2 text-2xl mt-3">
          Agent <span className="text-sw-yellow">{user?.username}</span>, Unit
          Zero is counting on you.
        </p>
      </div>

      {/* Primary call to action - continue the current case. */}
      <Link
        to="/play"
        className="ss-card p-8 flex flex-col items-center gap-2 text-center hover:border-sw-cyan transition-colors"
      >
        <span className="text-sw-text3">CURRENT ASSIGNMENT</span>
        <span className="font-pixel text-sw-pink text-xl md:text-2xl">
          CONTINUE CASE 01
        </span>
        <span className="text-sw-text2">The Bait — phishing investigation</span>
      </Link>

      {/* Stats summary. */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="ss-card p-5 text-center">
            <div className={`font-pixel text-base ${s.color}`}>{s.value}</div>
            <div className="text-sw-text3 mt-2">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
