import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { BADGE_CATALOG } from '../lib/badges.js'

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
  const [coinsLastWeek, setCoinsLastWeek] = useState(0)

  useEffect(() => {
    let cancelled = false
    api
      .getActivity(token, 15)
      .then((data) => {
        if (cancelled) return
        setActivity(data.items)
        setCoinsLastWeek(data.pointsLastWeek || 0)
      })
      .catch(() => {
        if (!cancelled) {
          setActivity([])
          setCoinsLastWeek(0)
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  if (!user) return null

  const earned = new Set((user.badges || []).map((b) => b.id))

  const level = user.level || 1
  const coins = user.points ?? user.totalScore ?? 0
  const coinScaleMax = Math.max(coins, coinsLastWeek, 1)
  const coinPct = Math.min(100, Math.round((coins / coinScaleMax) * 100))
  const lastWeekPct =
    coinsLastWeek > 0
      ? Math.min(100, Math.round((coinsLastWeek / coinScaleMax) * 100))
      : 0

  const stats = [
    { label: 'TOTAL COINS', value: coins },
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
          {user.customTitle && (
            <p className="font-pixel text-sw-pink text-xs mt-2">
              {user.customTitle}
            </p>
          )}
          <p className="text-sw-text2 mt-2">Level {level} Agent</p>
        </div>
      </div>

      <div className="ss-card p-5">
        <div className="flex justify-between text-sw-text3 mb-2">
          <span>Coins</span>
          <span>{coins} coins</span>
        </div>
        <div
          className="relative h-4 rounded overflow-visible"
          style={{ background: 'rgba(255,255,255,.1)' }}
          aria-label={`Coins progress. Current ${coins}. Last week ${coinsLastWeek}.`}
        >
          <div
            className="h-full rounded"
            style={{
              width: `${coinPct}%`,
              background: 'linear-gradient(90deg,var(--cyan),var(--pink))',
              boxShadow: '0 0 12px rgba(93,213,232,.55)',
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              left: `${lastWeekPct}%`,
              width: 3,
              height: 22,
              background: 'var(--yellow)',
              boxShadow: '0 0 10px var(--yellow)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
        <div className="flex justify-between text-sw-text3 text-xs mt-3">
          <span>0 coins</span>
          <span className="text-sw-yellow">
            Last week marker: {coinsLastWeek} coins
          </span>
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
