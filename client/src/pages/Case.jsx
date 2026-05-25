import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { IconArrowRight, IconFlag, IconLock } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext.jsx'
import { isCaseUnlocked } from '../lib/caseProgress.js'
import { api } from '../lib/api.js'
import { BADGES } from '../lib/badges.js'

const INTRO_STEPS = [
  {
    label: 'UNIT ZERO HQ - RECEPTION',
    time: 'DAY 1 - 08:42',
    speaker: 'Jane',
    speakerKey: 'jane',
    bubble: 'Morning. Visitor ID, please. Unit Zero does not do mystery guests.',
    intern: 'left',
  },
  {
    label: 'UNIT ZERO HQ - RECEPTION',
    time: 'DAY 1 - 08:43',
    speaker: 'Intern',
    speakerKey: 'intern',
    bubble: 'There you go. I was told to report for my first shift today.',
    intern: 'center',
  },
  {
    label: 'UNIT ZERO HQ - RECEPTION',
    time: 'DAY 1 - 08:44',
    speaker: 'Jane',
    speakerKey: 'jane',
    bubble:
      'Oh, you must be the new intern. Congratulations. Room S109 is down the hall.',
    intern: 'center',
  },
  {
    label: 'UNIT ZERO HQ - RECEPTION',
    time: 'DAY 1 - 08:45',
    speaker: 'Jane',
    speakerKey: 'jane',
    bubble: 'Log into your workstation and read the welcome notes before briefing.',
    intern: 'right',
  },
  {
    label: 'UNIT ZERO HQ - RECEPTION',
    time: 'DAY 1 - 08:46',
    speaker: 'Intern',
    speakerKey: 'intern',
    bubble: 'Thanks, Jane. I will head to S109 now.',
    intern: 'right',
  },
]

const RED_FLAGS = [
  {
    title: 'Spoofed domain',
    text: 'The sender used hr-rewards-unitzero.com, not the official Unit Zero domain.',
  },
  {
    title: 'Artificial urgency',
    text: 'The email pushed a two-hour deadline to rush your decision.',
  },
  {
    title: 'Visual impersonation',
    text: 'The logo and HR wording were copied to look official at a glance.',
  },
  {
    title: 'Credential harvesting',
    text: 'The form asked for personal and employee details a voucher never needs.',
  },
]

function PixelPerson({ role, label, position = '' }) {
  return (
    <div className={`pixel-person pixel-${role} ${position}`}>
      <div className="pixel-hair" />
      <div className="pixel-head">
        <span className="pixel-eye pixel-eye-left" />
        <span className="pixel-eye pixel-eye-right" />
        <span className="pixel-mouth" />
      </div>
      <div className="pixel-torso">
        <span className="pixel-arm pixel-arm-left" />
        <span className="pixel-badge" />
        <span className="pixel-arm pixel-arm-right" />
      </div>
      <div className="pixel-feet">
        <span />
        <span />
      </div>
      <div className="pixel-name">{label}</div>
    </div>
  )
}

function StoryScene({ step, onNext, internName, isLastStep, exiting }) {
  const speakerName = step.speakerKey === 'intern' ? internName : step.speaker

  return (
    <section className="case-scene scene-transition">
      <div className="case-scene-top">
        <span>{step.label}</span>
        <span>{step.time}</span>
      </div>

      <div className={`case-office ${exiting ? 'case-office-exiting' : ''}`}>
        <div className="case-window case-window-left">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="case-window case-window-right">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="unit-poster unit-poster-left">
          UNIT ZERO
          <br />
          CYBER UNIT
        </div>
        <div className="unit-poster unit-poster-right">
          UNIT ZERO
          <br />
          CYBER UNIT
        </div>

        <PixelPerson
          role="intern"
          label={`${internName} - YOU`}
          position={`pixel-intern-${step.intern}`}
        />

        <div className="pixel-desk">
          <PixelPerson role="jane" label="" />
          <div className="desk-front">RECEPTIONIST - JANE</div>
        </div>

        <div className={`case-bubble case-bubble-${step.speakerKey}`}>
          <span className="text-sw-yellow">{speakerName}</span>
          <p>{step.bubble}</p>
        </div>
      </div>

      <button
        type="button"
        className="ss-btn ss-btn-cyan self-end"
        onClick={onNext}
      >
        {isLastStep ? 'Enter Office' : 'Next'} <IconArrowRight size={16} />
      </button>
    </section>
  )
}

function InboxScene({ onNext, internName }) {
  const desktopItems = [
    { label: 'Files', icon: 'folder' },
    { label: 'Chat', icon: 'chat' },
    { label: 'Mail', icon: 'mail' },
    { label: 'Calendar', icon: 'calendar' },
    { label: 'Security', icon: 'security' },
    { label: 'Settings', icon: 'settings' },
  ]

  return (
    <section className="case-terminal ss-card scene-transition">
      <div className="case-terminal-header">
        <span>ROOM S109 - YOUR WORKSTATION</span>
        <span>DAY 1 - 08:52</span>
      </div>

      <div className="case-os-bar">
        <span>UNIT ZERO OS v4.2</span>
        <span>{internName.toLowerCase()}@unitzero.gov - DESKTOP</span>
      </div>

      <h2 className="case-os-welcome">WELCOME, {internName.toUpperCase()}</h2>
      <p className="case-os-subtitle">FIRST DAY ON THE JOB - STAY SHARP.</p>

      <div className="case-desktop-grid">
        {desktopItems.map((item) => (
            <div
              key={item.label}
              className={`case-desktop-tile ${
                item.label === 'Mail' ? 'active' : ''
              }`}
            >
              <span className={`desktop-pixel-icon icon-${item.icon}`} />
              <span>{item.label}</span>
            </div>
          ))}
      </div>

      <div className="jane-message">
        <strong>Jane (message):</strong> Welcome to Unit Zero. Stay sharp -
        nothing here is what it looks like.
      </div>

      <div className="case-inbox-label">INBOX (1 NEW)</div>
      <div className="case-inbox-row active">
        YOUR WELCOME GIFT VOUCHER - CLAIM BEFORE FRIDAY!
      </div>
      <button type="button" className="ss-btn ss-btn-cyan mt-4" onClick={onNext}>
        Open Email
      </button>
    </section>
  )
}

function EmailScene({ onClaim, onReport, internName }) {
  const [secondsLeft, setSecondsLeft] = useState(48 * 60 * 60)

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  return (
    <section className="case-email ss-card scene-transition">
      <div className="voucher-header">
        YOUR WELCOME GIFT VOUCHER - CLAIM BEFORE FRIDAY!
      </div>
      <div className="email-meta">
        <span>From:</span> hr-welcomedesk@unit-zero-benefits.cm
      </div>
      <div className="email-meta">
        <span>To:</span> {internName.toLowerCase()}@unitzero.gov
      </div>
      <div className="fake-hr-stamp">UNIT ZERO HR</div>
      <p>
        Congratulations on joining Unit Zero. As a token of appreciation, we
        have prepared a GBP 50 welcome voucher for you.
      </p>
      <p>Click below to claim it within 48 hours before it expires.</p>
      <div className="voucher-countdown">
        EXPIRES IN: {hours}:{minutes}:{seconds}
      </div>
      <div className="grid grid-cols-1 gap-3">
        <button type="button" className="voucher-claim-btn" onClick={onClaim}>
          Claim Your Voucher <IconArrowRight size={18} />
        </button>
        <button type="button" className="voucher-report-btn" onClick={onReport}>
          Report to supervisor
        </button>
      </div>
      <div className="case-choice-hint">
        Choose: click the voucher or report it
      </div>
    </section>
  )
}

function FakeForm({ onSubmit }) {
  return (
    <section className="case-form ss-card">
      <h2 className="font-pixel text-sw-pink text-sm">Voucher Verification</h2>
      <p className="text-sw-text2">
        Confirm your identity to release your staff reward.
      </p>
      <label>
        Full name
        <input className="ss-input" type="text" />
      </label>
      <label>
        Employee ID
        <input className="ss-input" type="text" />
      </label>
      <label>
        Home address
        <input className="ss-input" type="text" />
      </label>
      <button type="button" className="ss-btn ss-btn-red" onClick={onSubmit}>
        Submit
      </button>
    </section>
  )
}

function GlitchScreen({ onNext }) {
  return (
    <section className="case-glitch ss-card">
      <span className="font-pixel text-sw-red text-sm">REDIRECTING...</span>
      <div className="glitch-bars">
        <span />
        <span />
        <span />
      </div>
      <p>External verification portal loading.</p>
      <button type="button" className="ss-btn ss-btn-pink" onClick={onNext}>
        Continue
      </button>
    </section>
  )
}

function ZoeyBrief({ outcome, onNext }) {
  const isBreach = outcome === 'claim'
  return (
    <section className="case-zoey ss-card scene-transition">
      <div className="agent-avatar">
        <PixelPerson role="zoey" label="AGENT ZOEY" />
      </div>
      <div>
        <h2 className="font-pixel text-sw-cyan text-sm">Agent Zoey</h2>
        <p>
          {isBreach
            ? 'That portal was a phishing trap. The attacker harvested the details you typed into the form.'
            : 'Good call. That voucher was bait. Reporting it kept your details out of the attacker inbox.'}
        </p>
        <button
          type="button"
          className="ss-btn ss-btn-cyan mt-3"
          onClick={onNext}
        >
          Debrief
        </button>
      </div>
    </section>
  )
}

function Debrief({ outcome, onReplay, onContinue, busy }) {
  const isBreach = outcome === 'claim'

  return (
    <section className="case-debrief">
      <div className={isBreach ? 'breach-banner' : 'success-banner'}>
        {isBreach
          ? 'CASE BREACH - DEBRIEF MODE'
          : 'CASE SECURED - DEBRIEF MODE'}
      </div>
      <div className="ss-card p-5 flex flex-col gap-4">
        <div>
          <h2 className="font-pixel text-sw-cyan text-sm">CASE 01: THE BAIT</h2>
          <p className="text-sw-text2">
            {isBreach
              ? 'How you got hooked - 4 red flags you missed'
              : 'Why your report worked - 4 red flags you caught'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RED_FLAGS.map((flag) => (
            <article key={flag.title} className="red-flag-card">
              <IconFlag size={18} />
              <div>
                <h3>{flag.title}</h3>
                <p>{flag.text}</p>
              </div>
            </article>
          ))}
        </div>

        <blockquote className="zoey-quote">
          "Attackers do not need malware when urgency can make someone hand
          over the keys."
        </blockquote>

        {!isBreach && (
          <div className="badge-card">
            <span>Badge unlocked</span>
            <strong>SHARP EYES</strong>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="ss-btn ss-btn-pink"
            onClick={onReplay}
            disabled={busy}
          >
            Replay Scene
          </button>
          <button
            type="button"
            className="ss-btn ss-btn-cyan"
            onClick={onContinue}
            disabled={busy}
          >
            Continue
          </button>
        </div>
      </div>
    </section>
  )
}

function PixelBadgeCard({ badge, pointsAwarded }) {
  if (!badge) return null
  return (
    <div className="case-badge-unlock">
      <div className={`case-badge-icon badge-icon-${badge.icon || 'hook'}`}>
        <span />
      </div>
      <div>
        <span className="case-badge-kicker">Badge Unlocked</span>
        <strong>{badge.name}</strong>
        <p>{badge.message}</p>
        {pointsAwarded > 0 && (
          <span className="case-points-award">+{pointsAwarded} points</span>
        )}
      </div>
    </div>
  )
}

function EndScreen({ badge, pointsAwarded, onReturn, onVeteran }) {
  return (
    <section className="ss-card p-6 flex flex-col gap-4">
      <h2 className="font-pixel text-sw-cyan text-sm">
        Case 01 Rookie Complete
      </h2>
      <p className="text-sw-text2">Case file updated. Rookie reward secured.</p>
      <PixelBadgeCard badge={badge} pointsAwarded={pointsAwarded} />
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" className="ss-btn ss-btn-cyan" onClick={onReturn}>
          Return to Case Files
        </button>
        <button type="button" className="ss-btn ss-btn-pink" onClick={onVeteran}>
          Continue to Veteran Mode
        </button>
      </div>
    </section>
  )
}

function VeteranPlaceholder() {
  const navigate = useNavigate()

  return (
    <section className="ss-card p-6 flex flex-col gap-4 max-w-3xl mx-auto">
      <span className="font-pixel text-sw-pink text-xs">CASE 01 VETERAN</span>
      <h2 className="font-pixel text-sw-cyan text-sm">
        Case 01 Veteran - The Double Bluff
      </h2>
      <p className="text-sw-text2">
        Advanced phishing investigation coming next.
      </p>
      <button
        type="button"
        className="ss-btn ss-btn-cyan self-start"
        onClick={() => navigate('/play')}
      >
        Return to Case Files
      </button>
    </section>
  )
}

function LockedCase() {
  const navigate = useNavigate()
  return (
    <section className="ss-card p-6 flex flex-col gap-4 max-w-3xl mx-auto opacity-70">
      <IconLock size={28} className="text-sw-text3" />
      <h2 className="font-pixel text-sw-cyan text-sm">Case file locked</h2>
      <p className="text-sw-text2">
        Clear the previous case to access this file.
      </p>
      <button
        type="button"
        className="ss-btn ss-btn-cyan self-start"
        onClick={() => navigate('/play')}
      >
        Return to Case Files
      </button>
    </section>
  )
}

function NoLivesCase() {
  const navigate = useNavigate()
  return (
    <section className="ss-card p-6 flex flex-col gap-4 max-w-3xl mx-auto opacity-90">
      <IconLock size={28} className="text-sw-red" />
      <h2 className="font-pixel text-sw-cyan text-sm">No lives remaining</h2>
      <p className="text-sw-text2">
        You need at least 1 life to start a case.
      </p>
      <button
        type="button"
        className="ss-btn ss-btn-cyan self-start"
        onClick={() => navigate('/play')}
      >
        Return to Case Files
      </button>
    </section>
  )
}

function FutureCase({ caseId }) {
  const navigate = useNavigate()
  return (
    <section className="ss-card p-6 flex flex-col gap-4 max-w-3xl mx-auto">
      <span className="font-pixel text-sw-pink text-xs">CASE 0{caseId}</span>
      <h2 className="font-pixel text-sw-cyan text-sm">Coming next</h2>
      <p className="text-sw-text2">
        This investigation is a placeholder while Unit Zero prepares the file.
      </p>
      <button
        type="button"
        className="ss-btn ss-btn-cyan self-start"
        onClick={() => navigate('/play')}
      >
        Return to Case Files
      </button>
    </section>
  )
}

export default function Case() {
  const { caseId, difficulty = 'rookie' } = useParams()
  const { user, token, setUser } = useAuth()
  const navigate = useNavigate()
  const numericCaseId = Number(caseId)
  const [phase, setPhase] = useState('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const [outcome, setOutcome] = useState(null)
  const [badge, setBadge] = useState(null)
  const [pointsAwarded, setPointsAwarded] = useState(0)
  const [sceneExiting, setSceneExiting] = useState(false)
  const [resolvingDebrief, setResolvingDebrief] = useState(false)
  const [progressError, setProgressError] = useState('')
  const resolvingRef = useRef(false)
  const internName = user?.username || 'Nova'
  const hasLives = (user?.livesRemaining ?? 0) > 0

  if (!['rookie', 'veteran'].includes(difficulty)) {
    return <Navigate to={`/case/${caseId}/rookie`} replace />
  }

  if (!hasLives) return <NoLivesCase />
  if (!isCaseUnlocked(user, numericCaseId)) return <LockedCase />
  if (numericCaseId !== 1) return <FutureCase caseId={numericCaseId} />
  if (difficulty === 'veteran') return <VeteranPlaceholder />

  function nextIntro() {
    if (stepIndex < INTRO_STEPS.length - 1) {
      setStepIndex((value) => value + 1)
      return
    }
    setSceneExiting(true)
    setTimeout(() => {
      setSceneExiting(false)
      setPhase('inbox')
    }, 520)
  }

  async function spendFailureLife() {
    if (!token) throw new Error('You need to be signed in to update progress.')
    const data = await api.failAttempt(token, {
      caseId: numericCaseId,
      difficulty,
    })
    setUser(data.user)
    return data
  }

  async function handleClaimVoucher() {
    setPhase('glitch')
  }

  function restart() {
    setPhase('intro')
    setStepIndex(0)
    setOutcome(null)
    setBadge(null)
    setPointsAwarded(0)
    setSceneExiting(false)
    setResolvingDebrief(false)
    setProgressError('')
    resolvingRef.current = false
  }

  async function finishFailedAttempt(nextAction) {
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      await spendFailureLife()
      if (nextAction === 'replay') {
        restart()
        return
      }
      navigate('/play')
    } catch (error) {
      setProgressError(error.message || 'Could not update lives.')
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  async function awardRookieCompletion() {
    const unlockedBadge = BADGES.sharpEyes
    setBadge(unlockedBadge)
    if (!token) throw new Error('You need to be signed in to update progress.')
    const data = await api.completeCase(token, {
      caseId: 1,
      difficulty: 'rookie',
      result: 'success',
      badge: unlockedBadge,
    })
    setUser(data.user)
    setPointsAwarded(data.pointsAwarded)
    return { unlockedBadge, awarded: data.pointsAwarded }
  }

  async function replayAfterSuccess() {
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      await awardRookieCompletion()
      restart()
    } catch (error) {
      setProgressError(error.message || 'Could not update case progress.')
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  async function finishRookie() {
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      await awardRookieCompletion()
      setPhase('end')
    } catch (error) {
      setProgressError(error.message || 'Could not update case progress.')
    } finally {
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  return (
    <div className="case-shell max-w-5xl mx-auto">
      <div className="case-title-row">
        <div>
          <span className="font-pixel text-sw-pink text-xs">CASE 01 ROOKIE</span>
          <h2 className="font-pixel text-sw-cyan text-sm md:text-base">
            The Bait
          </h2>
        </div>
      </div>
      {progressError && (
        <div className="ss-card p-3 text-sw-red text-sm">{progressError}</div>
      )}

      {phase === 'intro' && (
        <StoryScene
          step={INTRO_STEPS[stepIndex]}
          onNext={nextIntro}
          internName={internName}
          isLastStep={stepIndex === INTRO_STEPS.length - 1}
          exiting={sceneExiting}
        />
      )}
      {phase === 'inbox' && (
        <InboxScene onNext={() => setPhase('email')} internName={internName} />
      )}
      {phase === 'email' && (
        <EmailScene
          internName={internName}
          onClaim={handleClaimVoucher}
          onReport={() => {
            setOutcome('report')
            setPhase('zoey')
          }}
        />
      )}
      {phase === 'glitch' && <GlitchScreen onNext={() => setPhase('form')} />}
      {phase === 'form' && (
        <FakeForm
          onSubmit={() => {
            setOutcome('claim')
            setPhase('zoey')
          }}
        />
      )}
      {phase === 'zoey' && (
        <ZoeyBrief outcome={outcome} onNext={() => setPhase('debrief')} />
      )}
      {phase === 'debrief' && (
        <Debrief
          outcome={outcome}
          onReplay={
            outcome === 'claim'
              ? () => finishFailedAttempt('replay')
              : replayAfterSuccess
          }
          onContinue={
            outcome === 'claim'
              ? () => finishFailedAttempt('continue')
              : finishRookie
          }
          busy={resolvingDebrief}
        />
      )}
      {phase === 'end' && (
        <EndScreen
          badge={badge}
          pointsAwarded={pointsAwarded}
          onReturn={() => navigate('/play')}
          onVeteran={() => navigate('/case/1/veteran')}
        />
      )}
    </div>
  )
}
