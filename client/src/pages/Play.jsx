import { useNavigate } from 'react-router-dom'
import { IconCheck, IconLock } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getCaseProgress,
  isCaseComplete,
  isCaseModeComplete,
  isCaseUnlocked,
} from '../lib/caseProgress.js'

const CASES = [
  {
    id: 1,
    title: 'The Bait',
    theme: 'Phishing',
    desc: 'Inbox forensics: spot the scam emails.',
  },
  {
    id: 2,
    title: 'The Network',
    theme: 'Cyberbullying',
    desc: 'A group chat turns hostile.',
  },
  {
    id: 3,
    title: 'The Insider',
    theme: 'Social engineering',
    desc: 'Who is really on the other end of the line?',
  },
  {
    id: 4,
    title: 'The Hotspot',
    theme: 'Public Wi-Fi',
    desc: 'A free hotspot, a dangerous coffee shop.',
  },
  {
    id: 5,
    title: 'The Mirage',
    theme: 'AI manipulation',
    desc: 'Deepfakes, voice clones, and prompt traps.',
  },
]

const DIFFICULTIES = ['rookie', 'veteran']

export default function Play() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const progress = getCaseProgress()
  const completedCount = CASES.filter((c) => isCaseComplete(c.id)).length
  const hasLives = (user?.livesRemaining ?? 0) > 0

  function openCase(caseId, difficulty) {
    if (!hasLives) return
    navigate(`/case/${caseId}/${difficulty}`)
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div>
        <h2 className="font-pixel text-sw-cyan text-glow text-base">
          CASE FILES
        </h2>
        <p className="text-sw-text3 mt-1">Select a case to investigate.</p>
        {!hasLives && (
          <p className="text-sw-red mt-2">
            You need at least 1 life to start a case.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CASES.map((c) => {
          const locked = !isCaseUnlocked(c.id)
          const complete = isCaseComplete(c.id)
          return (
            <article
              key={c.id}
              className={`ss-card p-5 flex flex-col gap-3 transition-colors ${
                locked
                  ? 'opacity-50'
                  : c.id === 1
                    ? 'border-sw-cyan'
                    : 'hover:border-sw-cyan'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-pixel text-sw-pink text-xs">
                  CASE 0{c.id}
                </span>
                {locked ? (
                  <IconLock size={18} className="text-sw-text3" stroke={1.5} />
                ) : complete ? (
                  <IconCheck size={18} className="text-sw-green" stroke={1.8} />
                ) : (
                  <span className="text-sw-cyan text-sm">ACTIVE</span>
                )}
              </div>

              <span className="font-pixel text-sw-cyan">{c.title}</span>
              <span className="text-sw-yellow text-sm">{c.theme}</span>
              <span className="text-sw-text2 text-sm mt-1">{c.desc}</span>

              <div
                className="grid grid-cols-2 gap-2 mt-2"
                role="group"
                aria-label={`Case 0${c.id} difficulty`}
              >
                {DIFFICULTIES.map((difficulty) => {
                  const done = isCaseModeComplete(c.id, difficulty)
                  return (
                    <button
                      key={difficulty}
                      type="button"
                      disabled={locked || !hasLives}
                      onClick={() => openCase(c.id, difficulty)}
                      className={`case-diff-btn ${
                        done ? 'case-diff-btn-complete' : ''
                      }`}
                    >
                      <span>{difficulty}</span>
                      {locked ? (
                        <IconLock size={14} stroke={1.8} />
                      ) : done ? (
                        <IconCheck size={14} stroke={2} />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </article>
          )
        })}
      </div>

      <p className="text-sw-text3 text-sm text-center">
        Case progress:{' '}
        <span className="text-sw-cyan">{completedCount} / {CASES.length}</span>
        {' '}files cleared - Badges:{' '}
        <span className="text-sw-yellow">{progress.badges.length}</span>
      </p>
    </div>
  )
}
