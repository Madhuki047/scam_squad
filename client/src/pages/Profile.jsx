import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { BADGE_CATALOG } from '../lib/badges.js'
import { getCaseProgress } from '../lib/caseProgress.js'

function xpForNextLevel(level) {
  return level * 500
}

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

export default function Profile() {
  const { user, token } = useAuth()
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

  const localBadges = getCaseProgress().badges
  const earned = new Set((user.badges || []).map((b) => b.id))
  for (const badgeName of localBadges) {
    const match = BADGE_CATALOG.find((badge) => badge.name === badgeName)
    if (match) earned.add(match.id)
  }

  const level = user.level || 1
  const nextLevelXp = xpForNextLevel(level)
  const xpPct = Math.min(100, Math.round(((user.xp || 0) / nextLevelXp) * 100))

  const stats = [
    { label: 'TOTAL SCORE', value: user.totalScore ?? 0 },
    { label: 'GLOBAL RANK', value: user.rank > 0 ? `#${user.rank}` : '--' },
    { label: 'ACCURACY', value: `${user.accuracy ?? 0}%` },
    { label: 'DAY STREAK', value: user.dayStreak ?? 0 },
  ]

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="ss-card p-6 flex items-center gap-6">
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="ss-card p-5 text-center">
            <div className="font-pixel text-sw-yellow text-sm">{s.value}</div>
            <div className="text-sw-text3 mt-2 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="ss-card p-5">
        <h3 className="font-pixel text-sw-pink text-sm mb-4">
          BADGES - {earned.size} / {BADGE_CATALOG.length}
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
                  className={
                    has
                      ? `profile-badge-icon badge-icon-${badge.icon || 'unit'}`
                      : 'profile-badge-locked'
                  }
                >
                  {has ? <span /> : <span>?</span>}
                </div>
                <span className="text-sw-text3 text-xs leading-tight">
                  {badge.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="ss-card p-5">
        <h3 className="font-pixel text-sw-pink text-sm mb-4">RECENT ACTIVITY</h3>
        {activity === null ? (
          <p className="text-sw-text3">Loading...</p>
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
