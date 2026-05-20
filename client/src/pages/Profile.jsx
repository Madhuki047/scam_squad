import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

// The 12-badge catalog. A badge counts as earned when its id appears in
// user.badges; the earning logic itself comes in later phases.
const BADGE_CATALOG = [
  { id: 'first-case', name: 'First Case' },
  { id: 'phishing-pro', name: 'Phishing Pro' },
  { id: 'quiz-streak', name: 'Quiz Streak' },
  { id: 'squad-up', name: 'Squad Up' },
  { id: 'veteran', name: 'Veteran' },
  { id: 'sharp-eye', name: 'Sharp Eye' },
  { id: 'night-owl', name: 'Night Owl' },
  { id: 'perfect-run', name: 'Perfect Run' },
  { id: 'mentor', name: 'Mentor' },
  { id: 'collector', name: 'Collector' },
  { id: 'unbreakable', name: 'Unbreakable' },
  { id: 'unit-zero', name: 'Unit Zero' },
]

// XP needed to reach the next level. Simple linear curve for now.
function xpForNextLevel(level) {
  return level * 500
}

// "5m ago", "2h ago", "3d ago" - tiny relative-time helper for the feed.
function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// Player profile: avatar, XP progress, stats, badges and activity.
export default function Profile() {
  const { user, token } = useAuth()

  // Recent activity feed (GET /api/activity). Fetched once on mount.
  const [activity, setActivity] = useState(null)
  useEffect(() => {
    let cancelled = false
    api
      .getActivity(token, 15)
      .then((data) => {
        if (!cancelled) setActivity(data.items)
      })
      .catch(() => {
        if (!cancelled) setActivity([])
      })
    return () => {
      cancelled = true
    }
  }, [token])

  if (!user) return null

  const earned = new Set((user.badges || []).map((b) => b.id))
  const level = user.level || 1
  const nextLevelXp = xpForNextLevel(level)
  const xpPct = Math.min(100, Math.round(((user.xp || 0) / nextLevelXp) * 100))

  const stats = [
    { label: 'TOTAL SCORE', value: user.totalScore ?? 0 },
    { label: 'GLOBAL RANK', value: user.rank > 0 ? `#${user.rank}` : '—' },
    { label: 'ACCURACY', value: `${user.accuracy ?? 0}%` },
    { label: 'DAY STREAK', value: user.dayStreak ?? 0 },
  ]

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Identity. */}
      <div className="ss-card p-6 flex items-center gap-6">
        {/* Placeholder pixel-art avatar. */}
        <div
          className="shrink-0"
          style={{
            width: 72,
            height: 72,
            background: 'var(--cyan)',
            boxShadow: '0 0 16px var(--cyan)',
          }}
        />
        <div>
          <h2 className="font-pixel text-sw-cyan text-base">{user.username}</h2>
          <p className="text-sw-text2 mt-2">Level {level} Agent</p>
        </div>
      </div>

      {/* XP progress. */}
      <div className="ss-card p-5">
        <div className="flex justify-between text-sw-text3 mb-2">
          <span>XP</span>
          <span>
            {user.xp || 0} / {nextLevelXp}
          </span>
        </div>
        <div
          className="h-3 rounded overflow-hidden"
          style={{ background: 'rgba(255,255,255,.1)' }}
        >
          <div
            className="h-full rounded"
            style={{
              width: `${xpPct}%`,
              background: 'linear-gradient(90deg,var(--cyan),var(--pink))',
            }}
          />
        </div>
      </div>

      {/* Stats grid. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="ss-card p-5 text-center">
            <div className="font-pixel text-sw-yellow text-sm">{s.value}</div>
            <div className="text-sw-text3 mt-2 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badge grid. */}
      <div className="ss-card p-5">
        <h3 className="font-pixel text-sw-pink text-sm mb-4">
          BADGES — {earned.size} / {BADGE_CATALOG.length}
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
          {BADGE_CATALOG.map((badge) => {
            const has = earned.has(badge.id)
            return (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-1 text-center"
              >
                <div
                  className="w-12 h-12 rounded flex items-center justify-center"
                  style={{
                    background: has ? 'var(--violet)' : 'rgba(255,255,255,.06)',
                    boxShadow: has ? '0 0 12px var(--violet)' : 'none',
                    opacity: has ? 1 : 0.4,
                  }}
                >
                  <span className="font-pixel text-[10px] text-sw-text">
                    {has ? '★' : '?'}
                  </span>
                </div>
                <span className="text-sw-text3 text-xs leading-tight">
                  {badge.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent activity (GET /api/activity). */}
      <div className="ss-card p-5">
        <h3 className="font-pixel text-sw-pink text-sm mb-4">RECENT ACTIVITY</h3>
        {activity === null ? (
          <p className="text-sw-text3">Loading…</p>
        ) : activity.length === 0 ? (
          <p className="text-sw-text3">
            No recent activity yet. Solve a case to get started.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {activity.map((entry) => (
              <li
                key={entry._id}
                className="flex items-center justify-between gap-4 py-1"
                style={{ borderBottom: '1px solid var(--line)' }}
              >
                <span className="text-sw-text2">{entry.message}</span>
                <span className="text-sw-text3 text-sm shrink-0">
                  {relativeTime(entry.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
