import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  IconAlertTriangle,
  IconArrowRight,
  IconFlag,
  IconLock,
} from '@tabler/icons-react'
import { completeCaseMode, isCaseUnlocked } from '../lib/caseProgress.js'

const INTRO_STEPS = [
  {
    label: 'UNIT ZERO HQ - RECEPTION',
    time: 'DAY 01 / 09:02',
    speaker: 'Jane',
    bubble: 'Welcome to Unit Zero, intern. Agent Zoey is waiting upstairs.',
    intern: 'left',
  },
  {
    label: 'UNIT ZERO HQ - RECEPTION',
    time: 'DAY 01 / 09:04',
    speaker: 'Intern',
    bubble: 'First shift. No pressure. Where do I report in?',
    intern: 'center',
  },
  {
    label: 'UNIT ZERO HQ - RECEPTION',
    time: 'DAY 01 / 09:05',
    speaker: 'Jane',
    bubble: 'Workstation 7. Check your inbox before the morning briefing.',
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

function StoryScene({ step, onNext }) {
  return (
    <section className="case-scene">
      <div className="case-scene-top">
        <span>{step.label}</span>
        <span>{step.time}</span>
      </div>

      <div className="case-office">
        <div className={`pixel-intern pixel-intern-${step.intern}`}>
          <div className="pixel-head" />
          <div className="pixel-body" />
          <div className="pixel-legs" />
        </div>

        <div className="pixel-desk">
          <div className="pixel-receptionist">
            <div className="pixel-head" />
            <div className="pixel-body" />
          </div>
          <div className="desk-front">JANE</div>
        </div>

        <div className="case-bubble">
          <span className="text-sw-yellow">{step.speaker}</span>
          <p>{step.bubble}</p>
        </div>
      </div>

      <button
        type="button"
        className="ss-btn ss-btn-cyan self-end"
        onClick={onNext}
      >
        Next <IconArrowRight size={16} />
      </button>
    </section>
  )
}

function InboxScene({ onNext }) {
  return (
    <section className="case-terminal ss-card">
      <div className="case-terminal-header">
        <span>WORKSTATION 7 - INBOX</span>
        <span>3 NEW</span>
      </div>
      <div className="case-inbox-row muted">
        IT Helpdesk - Password rotation reminder
      </div>
      <div className="case-inbox-row active">
        HR Rewards - URGENT: Claim your staff voucher
      </div>
      <div className="case-inbox-row muted">
        Agent Zoey - Morning briefing at 10
      </div>
      <button type="button" className="ss-btn ss-btn-cyan mt-4" onClick={onNext}>
        Open Email
      </button>
    </section>
  )
}

function EmailScene({ onClaim, onReport }) {
  return (
    <section className="case-email ss-card">
      <div className="text-sw-text3">
        From: HR Rewards &lt;bonus@hr-rewards-unitzero.com&gt;
      </div>
      <h2 className="font-pixel text-sw-pink text-sm">
        URGENT: Claim your Unit Zero voucher
      </h2>
      <p>
        Interns who verify their details in the next 2 hours receive a 200
        credit welcome voucher. Click below before your reward expires.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button type="button" className="ss-btn ss-btn-pink" onClick={onClaim}>
          Claim voucher
        </button>
        <button type="button" className="ss-btn ss-btn-cyan" onClick={onReport}>
          Report to supervisor
        </button>
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
    <section className="case-zoey ss-card">
      <div className="agent-avatar">Z</div>
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

function Debrief({ outcome, onReplay, onContinue }) {
  const isBreach = outcome === 'claim'
  const badge = isBreach ? 'Hooked Once' : 'Sharp Eyes'

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

        <div className="badge-card">
          <span>Badge unlocked</span>
          <strong>{badge.toUpperCase()}</strong>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="ss-btn ss-btn-pink"
            onClick={onReplay}
          >
            Replay Scene
          </button>
          <button
            type="button"
            className="ss-btn ss-btn-cyan"
            onClick={onContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </section>
  )
}

function EndScreen({ badge, onReturn, onVeteran }) {
  return (
    <section className="ss-card p-6 flex flex-col gap-4">
      <h2 className="font-pixel text-sw-cyan text-sm">
        Case 01 Rookie Complete
      </h2>
      <p className="text-sw-text2">
        Case file updated. Badge unlocked:{' '}
        <span className="text-sw-yellow uppercase">{badge}</span>
      </p>
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

  function returnToFiles() {
    completeCaseMode(1, 'veteran')
    navigate('/play')
  }

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
        onClick={returnToFiles}
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
  const navigate = useNavigate()
  const numericCaseId = Number(caseId)
  const [phase, setPhase] = useState('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const [outcome, setOutcome] = useState(null)
  const [badge, setBadge] = useState(null)

  if (!['rookie', 'veteran'].includes(difficulty)) {
    return <Navigate to={`/case/${caseId}/rookie`} replace />
  }

  if (!isCaseUnlocked(numericCaseId)) return <LockedCase />
  if (numericCaseId !== 1) return <FutureCase caseId={numericCaseId} />
  if (difficulty === 'veteran') return <VeteranPlaceholder />

  function nextIntro() {
    if (stepIndex < INTRO_STEPS.length - 1) {
      setStepIndex((value) => value + 1)
      return
    }
    setPhase('inbox')
  }

  function restart() {
    setPhase('intro')
    setStepIndex(0)
    setOutcome(null)
    setBadge(null)
  }

  function finishRookie() {
    const unlockedBadge = outcome === 'claim' ? 'Hooked Once' : 'Sharp Eyes'
    completeCaseMode(1, 'rookie', unlockedBadge)
    setBadge(unlockedBadge)
    setPhase('end')
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
        <div className="case-threat">
          <IconAlertTriangle size={18} />
          Phishing Drill
        </div>
      </div>

      {phase === 'intro' && (
        <StoryScene step={INTRO_STEPS[stepIndex]} onNext={nextIntro} />
      )}
      {phase === 'inbox' && <InboxScene onNext={() => setPhase('email')} />}
      {phase === 'email' && (
        <EmailScene
          onClaim={() => setPhase('glitch')}
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
          onReplay={restart}
          onContinue={finishRookie}
        />
      )}
      {phase === 'end' && (
        <EndScreen
          badge={badge}
          onReturn={() => navigate('/play')}
          onVeteran={() => navigate('/case/1/veteran')}
        />
      )}
    </div>
  )
}
