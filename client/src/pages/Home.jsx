import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { MAX_LIVES } from '../lib/gameRules.js'
import { isCaseModeComplete } from '../lib/caseProgress.js'
import { playSfx, startSfxLoop, stopSfxLoop } from '../lib/sound.js'

const INTRO_LINES = [
  {
    speaker: 'Unknown Caller',
    text: 'Recruit... good. You logged in. That means you are ready.',
    response: 'Answer',
  },
  {
    speaker: 'Unknown Caller',
    text:
      'You have just been activated for a classified operation. A taskforce that works quietly to protect people online.',
    response: 'I am listening',
  },
  {
    speaker: 'Unknown Caller',
    text: 'Most people never hear about us. Even fewer get invited.',
    response: 'Continue',
  },
  {
    speaker: 'Unknown Caller',
    text:
      'The digital world is full of hidden dangers - scams, fake profiles, stolen data, cyberbullies. Every day, someone walks straight into a trap.',
    response: 'Understood',
  },
  {
    speaker: 'Unknown Caller',
    text: 'That is why we need you.',
    response: 'Continue',
  },
  {
    speaker: 'Commander Vega',
    text: 'This is Commander Vega. Welcome to the Cybercrime Unit, Recruit.',
    response: 'Understood',
  },
  {
    speaker: 'Commander Vega',
    text:
      'From this moment on, you are part of a team that stops online threats before they spread.',
    response: 'Continue',
  },
  {
    speaker: 'Commander Vega',
    text:
      'You will be handling five high priority cases. Each one is based on real cyber threats happening right now.',
    response: 'I am ready',
  },
  {
    speaker: 'Commander Vega',
    text: 'Your choices will shape every outcome. Choose wisely.',
    response: 'Understood',
  },
  {
    speaker: 'Commander Vega',
    text:
      'Before we begin, you will need to verify your identity. Security first. Always.',
    response: 'Verify identity',
  },
  {
    speaker: 'System',
    text: 'CYBERCRIME UNIT: CASE FILES INITIATED',
    response: 'Initiate',
  },
]

function getHomeAssignment(user) {
  if (!isCaseModeComplete(user, 1, 'rookie')) {
    return {
      to: '/case/1/rookie',
      caseLabel: 'CASE 01',
      title: 'CONTINUE CASE 01',
      monitorTitle: 'THE BAIT',
      subtitle: 'The Bait - phishing investigation',
      variant: 'phishing',
    }
  }
  if (!isCaseModeComplete(user, 1, 'veteran')) {
    return {
      to: '/case/1/veteran',
      caseLabel: 'CASE 01',
      title: 'CONTINUE CASE 01',
      monitorTitle: 'DOUBLE BLUFF',
      subtitle: 'The Bait - veteran phishing continuation',
      variant: 'phishing',
    }
  }
  if (!isCaseModeComplete(user, 2, 'rookie')) {
    return {
      to: '/case/2/rookie',
      caseLabel: 'CASE 02',
      title: 'START CASE 02',
      monitorTitle: 'THE NETWORK',
      subtitle: 'The Network - cyberbullying and group dynamics',
      variant: 'network',
    }
  }
  if (!isCaseModeComplete(user, 2, 'veteran')) {
    return {
      to: '/case/2/veteran',
      caseLabel: 'CASE 02',
      title: 'CONTINUE CASE 02',
      monitorTitle: 'THE PILE-ON',
      subtitle: 'The Network - veteran pile-on investigation',
      variant: 'network',
    }
  }
  if (!isCaseModeComplete(user, 3, 'rookie')) {
    return {
      to: '/case/3/rookie',
      caseLabel: 'CASE 03',
      title: 'START CASE 03',
      monitorTitle: 'THE INSIDER',
      subtitle: 'The Insider - social engineering and trust checks',
      variant: 'network',
    }
  }
  return {
    to: '/play',
    caseLabel: 'CASE FILES',
    title: 'CONTINUE CASE FILES',
    monitorTitle: 'NEXT FILE',
    subtitle: 'Review your unlocked investigations',
    variant: 'network',
  }
}

function AssignmentCard({ assignment }) {
  return (
    <Link
      to={assignment.to}
      className={`ss-card home-assignment-card home-assignment-${assignment.variant} hover:border-sw-cyan transition-colors`}
      onClick={() => playSfx('missionBriefing')}
    >
      <div className="home-assignment-scene" aria-hidden="true">
        <div className="home-agent-shadow">
          <span className="home-agent-head" />
          <span className="home-agent-coat" />
        </div>
        <div className="home-mission-desk">
          <div className="home-monitor">
            <span>{assignment.caseLabel}</span>
            <strong>{assignment.monitorTitle}</strong>
          </div>
          <div className="home-keyboard" />
        </div>
        {assignment.variant === 'network' && (
          <div className="home-network-feed">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <div className="home-assignment-brief">
        <span className="text-sw-text3">CURRENT ASSIGNMENT</span>
        <span className="font-pixel text-sw-pink text-xl md:text-2xl">
          {assignment.title}
        </span>
        <span className="text-sw-text2">{assignment.subtitle}</span>
        <span className="home-mission-chip">Open mission briefing</span>
      </div>
    </Link>
  )
}

function PhoneIntro({ onComplete, busy, error }) {
  const [answered, setAnswered] = useState(false)
  const [lineIndex, setLineIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const navigate = useNavigate()
  const currentLine = INTRO_LINES[lineIndex]

  useEffect(() => {
    if (answered || finished) {
      stopSfxLoop('phoneRing')
      return undefined
    }
    startSfxLoop('phoneRing')
    return () => stopSfxLoop('phoneRing')
  }, [answered, finished])

  function startRingFromScene(event) {
    if (event.target.closest('button')) return
    if (!answered && !finished) startSfxLoop('phoneRing')
  }

  async function advance() {
    if (!answered) {
      stopSfxLoop('phoneRing')
      playSfx('pickup')
      setAnswered(true)
      return
    }

    if (lineIndex < INTRO_LINES.length - 1) {
      setLineIndex((value) => value + 1)
      return
    }

    setFinished(true)
    await onComplete()
  }

  if (finished) {
    return (
      <section className="ss-card home-verify-card">
        <span className="font-pixel text-sw-cyan text-sm">
          IDENTITY CHECKPOINT
        </span>
        <h3>Identity verification coming next</h3>
        <p>
          Commander Vega has opened your case access. Full identity verification
          will be added in a later phase.
        </p>
        {error && <p className="text-sw-red">{error}</p>}
        <button
          type="button"
          className="ss-btn ss-btn-cyan self-start"
          onClick={() => {
            playSfx('missionBriefing')
            navigate('/play')
          }}
          disabled={busy}
        >
          Proceed to case files
        </button>
      </section>
    )
  }

  return (
    <section
      className="ss-card home-phone-card"
      onPointerDown={startRingFromScene}
    >
      <div className="home-phone-scene">
        <div className={`home-phone ${answered ? 'home-phone-answered' : ''}`}>
          <div className="home-phone-receiver" />
          <div className="home-phone-body">
            <div className="home-phone-dial">
              {Array.from({ length: 9 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
            <div className="home-phone-cord" />
          </div>
        </div>

        {answered && (
          <div className="home-phone-bubble scene-transition">
            <span className="font-pixel text-sw-yellow text-xs">
              {currentLine.speaker}
            </span>
            <p>{currentLine.text}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-sw-text3">SECURE LINE</span>
          <h3 className="font-pixel text-sw-pink text-xl">
            INCOMING TRANSMISSION
          </h3>
        </div>
        <button
          type="button"
          className="ss-btn ss-btn-cyan"
          onClick={advance}
          disabled={busy}
        >
          {answered ? currentLine.response : 'Answer Call'}
        </button>
      </div>
      {error && <p className="text-sw-red">{error}</p>}
    </section>
  )
}

// Home screen: welcome heading, intro/assignment call to action, and a
// quick stats summary. Rendered inside AppLayout.
export default function Home() {
  const { user, token, setUser } = useAuth()
  const [rank, setRank] = useState('Unranked')
  const [introBusy, setIntroBusy] = useState(false)
  const [introError, setIntroError] = useState('')
  const [introJustCompleted, setIntroJustCompleted] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false

    api
      .getMyRank(token)
      .then((data) => {
        if (cancelled) return
        const coins = data.points ?? data.totalScore ?? 0
        setRank(coins > 0 && data.rank ? `#${data.rank}` : 'Unranked')
      })
      .catch(() => {
        if (!cancelled) setRank('Unranked')
      })

    return () => {
      cancelled = true
    }
  }, [token, user?.points, user?.totalScore])

  const introComplete = Boolean(user?.introCompleted)
  const assignment = useMemo(() => getHomeAssignment(user), [user])
  const lives = Math.min(user?.livesRemaining ?? 0, MAX_LIVES)
  const stats = useMemo(
    () => [
      { label: 'LIVES', value: `${lives} / ${MAX_LIVES}`, color: 'text-sw-red' },
      {
        label: 'POINTS',
        value: user?.points ?? user?.totalScore ?? 0,
        color: 'text-sw-yellow',
      },
      { label: 'RANK', value: rank, color: 'text-sw-cyan' },
    ],
    [lives, rank, user?.points, user?.totalScore],
  )

  async function completeIntro() {
    if (!token) return
    setIntroBusy(true)
    setIntroError('')
    try {
      const data = await api.completeIntro(token)
      setUser(data.user)
      setIntroJustCompleted(true)
    } catch (error) {
      console.error('[progress] Intro completion update failed', {
        endpoint: '/progress/complete-intro',
        message: error.message,
      })
      setIntroError(error.message || 'Could not save intro progress.')
    } finally {
      setIntroBusy(false)
    }
  }

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

      {introComplete && !introJustCompleted ? (
        <AssignmentCard assignment={assignment} />
      ) : (
        <PhoneIntro
          onComplete={completeIntro}
          busy={introBusy}
          error={introError}
        />
      )}

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
