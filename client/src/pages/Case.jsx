import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { IconArrowRight, IconFlag, IconLock } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext.jsx'
import { isCaseModeUnlocked } from '../lib/caseProgress.js'
import { api } from '../lib/api.js'
import { BADGES } from '../lib/badges.js'
import { playSfx } from '../lib/sound.js'

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

const VETERAN_LESSONS = [
  {
    title: 'Display name spoofing',
    text: 'The name shown in an email is not always the real sender.',
  },
  {
    title: 'Domain deception',
    text: 'unitzero.gov.co is not the same as unitzero.gov.com.',
  },
  {
    title: 'Calm can still be dangerous',
    text: 'Sophisticated phishing may avoid panic tactics and obvious errors.',
  },
  {
    title: 'Verify out-of-band',
    text: 'Confirm unexpected requests through a separate trusted channel.',
  },
]

const TRACE_INDICATORS = [
  {
    id: 'display',
    label: 'Display name: Agent Zoey',
    suspicious: false,
    detail: 'A familiar display name alone is not proof of identity.',
  },
  {
    id: 'reply',
    label: 'Reply-To: case-access@unitzero.gov.co',
    suspicious: true,
    detail: 'The reply-to uses a lookalike domain controlled outside Unit Zero.',
  },
  {
    id: 'domain',
    label: 'Link host: secure.unitzero.gov.co',
    suspicious: true,
    detail: 'The registered domain is gov.co, not the Unit Zero gov.com domain.',
  },
  {
    id: 'time',
    label: 'Sent: 16:20, near end of day',
    suspicious: false,
    detail: 'Timing can add pressure, but it is not enough by itself.',
  },
  {
    id: 'source',
    label: 'Source IP reputation: recent credential harvest kit',
    suspicious: true,
    detail: 'Infrastructure reputation links this email to active phishing.',
  },
]

const VETERAN_QUIZ = [
  {
    question: 'Why is agentzoey.a@unitzero.gov not automatically trustworthy?',
    options: [
      'All government-looking emails are unsafe.',
      'The display name and sender can be spoofed or compromised.',
      'Casual wording always proves an email is fake.',
      'Short emails are always phishing.',
    ],
    answer: 1,
  },
  {
    question: 'Which domain is the suspicious lookalike in this case?',
    options: [
      'unitzero.gov.com',
      'mail.unitzero.gov.com',
      'unitzero.gov.co',
      'casefiles.unitzero.gov.com',
    ],
    answer: 2,
  },
  {
    question: 'What should you do before using an unexpected login link?',
    options: [
      'Click quickly before the request expires.',
      'Forward the link to another intern.',
      'Verify through a separate trusted channel.',
      'Trust it if there are no typos.',
    ],
    answer: 2,
  },
  {
    question: 'Why does "no panic tactic" not make the email safe?',
    options: [
      'Only messages with countdowns are dangerous.',
      'Calm emails cannot contain links.',
      'Safe emails always mention rewards.',
      'Professional phishing can sound calm and routine.',
    ],
    answer: 3,
  },
  {
    question: 'What is credential harvesting?',
    options: [
      'Encrypting files after a backup.',
      'Scanning a computer for old documents.',
      'Tricking someone into entering login details into a fake portal.',
      'Sending a security reminder to staff.',
    ],
    answer: 2,
  },
  {
    question: 'Which clue is strongest in the server-log trace?',
    options: [
      'The sender uses a friendly tone.',
      'The email mentions a real project.',
      'A link host on a lookalike domain.',
      'The message is not very long.',
    ],
    answer: 2,
  },
  {
    question: 'What does hovering over a link help reveal?',
    options: [
      'The sender password.',
      'The real destination URL before clicking.',
      'Whether the email has been read.',
      'The exact attacker location.',
    ],
    answer: 1,
  },
  {
    question: 'Why is messaging Agent Zoey directly safer?',
    options: [
      'It deletes the phishing email automatically.',
      'It makes the link expire.',
      'It uses a separate trusted channel to verify the request.',
      'It blocks every future phishing email.',
    ],
    answer: 2,
  },
  {
    question: 'What should happen after credentials are typed into a fake portal?',
    options: [
      'Try the same password again later.',
      'Assume access was confirmed safely.',
      'Ignore it if the page looked official.',
      'Treat it as a breach and report it immediately.',
    ],
    answer: 3,
  },
  {
    question: 'What is the best overall lesson from The Double Bluff?',
    options: [
      'Only typo-filled emails are phishing.',
      'Legitimate-looking requests still need verification.',
      'Supervisors never send links.',
      'A familiar sender name proves the email is safe.',
    ],
    answer: 1,
  },
]

const CASE2_THREADS = [
  {
    id: 'direct-insults',
    title: "Comment chain on Emma's profile",
    source: 'GlowLoop social feed',
    reportId: 'GL-2048-A',
    moment: 'After school, Monday',
    place: "Emma's profile",
    confidence: 61,
    queueNote: 'Forwarded by two students in Emma\'s year.',
    correctAction: 'flag',
    profile: { handle: '@maxbyte', posts: 42, reports: 2, relation: 'classmate' },
    messages: [
      { author: '@maxbyte', time: '15:04', text: 'emma is actually so annoying' },
      { author: '@maxbyte', time: '15:05', text: 'like why is she even here' },
      { author: '@emma.draws', time: '15:06', text: 'can you stop please' },
    ],
    explanation:
      'Direct insults targeting Emma are abusive comments, not normal disagreement.',
  },
  {
    id: 'appearance-mockery',
    title: 'Photo reply pile-on',
    source: 'Photo post replies',
    reportId: 'GL-2048-B',
    moment: 'Evening, Monday',
    place: 'Photo replies',
    confidence: 58,
    queueNote: 'Pulled from comments under Emma\'s latest photo.',
    correctAction: 'flag',
    profile: { handle: '@mirrorfail', posts: 18, reports: 1, relation: 'unknown' },
    messages: [
      { author: '@mirrorfail', time: '19:22', text: 'not the haircut again' },
      { author: '@mirrorfail', time: '19:23', text: 'someone tell her mirrors exist' },
      { author: '@tess88', time: '19:24', text: 'leave her alone' },
    ],
    explanation:
      'Appearance mockery is targeted humiliation. Platforms should treat that as bullying.',
  },
  {
    id: 'repeated-targeting',
    title: 'Replies after Emma joins',
    source: 'GlowLoop replies',
    reportId: 'GL-2048-C',
    moment: 'Tuesday afternoon',
    place: 'Class feed replies',
    confidence: 54,
    queueNote: 'A short burst of replies after Emma joined the thread.',
    correctAction: 'flag',
    profile: { handle: '@crashpost', posts: 103, reports: 3, relation: 'same year group' },
    timeline: ['15:12', '15:19', '15:27', '15:40'],
    messages: [
      { author: '@crashpost', time: '15:12', text: 'not this again' },
      { author: '@crashpost', time: '15:19', text: 'emma always makes it weird' },
      { author: '@crashpost', time: '15:27', text: 'nobody was talking to you' },
      { author: '@crashpost', time: '15:40', text: 'okayyy...' },
    ],
    explanation:
      'Repetition is a key bullying signal. One comment might be conflict; a repeated stream becomes targeting.',
  },
  {
    id: 'group-exclusion',
    title: 'ArtTable group chat',
    source: 'Private group export',
    reportId: 'GL-2048-D',
    moment: 'Across the week',
    place: 'ArtTable chat',
    confidence: 37,
    queueNote: 'Export from a group chat Emma used to be active in.',
    correctAction: 'flag',
    profile: { handle: 'Group: ArtTable', posts: 12, reports: 0, relation: 'friend group' },
    timeline: [
      'Tue 18:42 - Emma: are we still doing the film thing?',
      'Tue 18:44 - Nina: oh nvm',
      'Thu 12:10 - Emma: where did everyone sit?',
      'Thu 12:31 - Kai: we already filled the spots sorry',
      'Sat 19:03 - Emma: invite did not work',
      'Sat 19:04 - Mika: inside joke, do not worry',
      'Mon 16:18 - Emma: is this still the project chat?',
      'Mon 16:52 - seen by 5',
    ],
    messages: [
      { author: '@nina', time: 'Tue 18:41', text: 'movie later?' },
      { author: '@emma.draws', time: 'Tue 18:42', text: 'i can come if there is space' },
      { author: '@nina', time: 'Tue 18:44', text: 'oh nvm' },
      { author: '@kai', time: 'Thu 12:10', text: 'new table today' },
      { author: '@emma.draws', time: 'Thu 12:11', text: 'where?' },
      { author: '@kai', time: 'Thu 12:31', text: 'we already filled the spots sorry' },
      { author: '@mika', time: 'Sat 19:03', text: 'wait who added Emma' },
      { author: '@nina', time: 'Mon 16:52', text: 'seen by 5' },
    ],
    explanation:
      'Passive exclusion can be cyberbullying when it is repeated and coordinated to isolate someone.',
  },
  {
    id: 'plausible-deniability',
    title: 'Short comments from @johnhaha67',
    source: 'Cross-post activity log',
    reportId: 'GL-2048-E',
    moment: 'Mon-Sun',
    place: "Emma's recent posts",
    confidence: 33,
    queueNote: 'Short comments copied from a few of Emma\'s recent posts.',
    correctAction: 'flag',
    profile: { handle: '@johnhaha67', posts: 9, reports: 0, relation: 'follows Emma' },
    timeline: [
      'Mon - Emma posts sketch: @johnhaha67 "lol"',
      'Tue - Emma posts lunch photo: @johnhaha67 "imagine"',
      'Thu - Emma posts homework win: @johnhaha67 "sure Emma"',
      'Fri - Emma posts outfit: @johnhaha67 "interesting timing"',
      'Sun - Emma deletes reply after @johnhaha67 "not this again"',
    ],
    messages: [
      { author: '@johnhaha67', time: 'Mon 20:14', text: 'lol' },
      { author: '@johnhaha67', time: 'Tue 12:03', text: 'imagine' },
      { author: '@johnhaha67', time: 'Thu 18:20', text: 'sure Emma' },
      { author: '@johnhaha67', time: 'Fri 21:09', text: 'interesting timing' },
      { author: '@johnhaha67', time: 'Sun 16:44', text: 'not this again' },
    ],
    explanation:
      '"Just joking" comments can be plausible deniability. The pattern shows repeated targeting.',
  },
  {
    id: 'one-off-disagreement',
    title: 'Debate under a group project post',
    source: 'GlowLoop class feed',
    reportId: 'GL-2048-F',
    moment: 'Wednesday morning',
    place: 'Project post',
    confidence: 46,
    queueNote: 'A classroom thread with a disagreement in the replies.',
    correctAction: 'dismiss',
    profile: { handle: '@rowan7', posts: 27, reports: 0, relation: 'project partner' },
    messages: [
      { author: '@emma.draws', time: '10:11', text: 'i think the poster needs sources first' },
      { author: '@rowan7', time: '10:12', text: 'i disagree, it is fine as it is' },
      { author: '@emma.draws', time: '10:13', text: "okay, let's ask the group" },
    ],
    explanation:
      'A one-off disagreement between equal participants is conflict, not cyberbullying.',
  },
  {
    id: 'consensual-banter',
    title: 'Friends joking after a game',
    source: 'GlowLoop game clip replies',
    reportId: 'GL-2048-G',
    moment: 'Friday night',
    place: 'Game clip replies',
    confidence: 49,
    queueNote: 'A clip from last night\'s game session.',
    correctAction: 'dismiss',
    profile: { handle: '@maya-lol', posts: 64, reports: 0, relation: 'friend' },
    messages: [
      { author: '@emma.draws', time: '21:30', text: 'i cannot believe i missed that easy shot' },
      { author: '@maya-lol', time: '21:31', text: 'legendary fail, but you carried us last round' },
      { author: '@emma.draws', time: '21:31', text: 'fair. i deserve that one' },
    ],
    explanation:
      'Playful banter with consent and friendly context should not be treated as bullying.',
  },
  {
    id: 'constructive-comment',
    title: 'Art club feedback',
    source: 'GlowLoop creative post',
    reportId: 'GL-2048-H',
    moment: 'Sunday afternoon',
    place: 'Art club post',
    confidence: 41,
    queueNote: 'A comment under Emma\'s art club post.',
    correctAction: 'dismiss',
    profile: { handle: '@sketchroom', posts: 88, reports: 0, relation: 'art club' },
    messages: [
      { author: '@sketchroom', time: '17:02', text: 'the color palette is strong' },
      { author: '@sketchroom', time: '17:03', text: 'maybe add contrast around the title so it is easier to read' },
      { author: '@emma.draws', time: '17:05', text: 'good idea, thanks' },
    ],
    explanation:
      'Constructive comments focus on the work and do not target, shame, or repeat harm.',
  },
]

const CASE2_TEACHING_POINTS = [
  {
    title: 'Conflict vs bullying',
    text: 'Bullying often involves repetition, intent, and a power imbalance.',
  },
  {
    title: 'Passive exclusion counts',
    text: 'Repeatedly cutting someone out of chats, plans, and events can cause real harm.',
  },
  {
    title: 'Plausible deniability',
    text: '"Just joking", "lol", and vague comments can hide targeted harassment.',
  },
  {
    title: 'Cumulative harm',
    text: 'Cyberbullying can build through many small hits instead of one obvious attack.',
  },
  {
    title: 'Witness responsibility',
    text: 'Platforms and bystanders can enable bullying by ignoring soft behaviour patterns.',
  },
]

const CASE2_PASS_THRESHOLD = 6
const CASE2_DECISION_REWARD = 10

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

function VeteranInbox({ onNext, internName }) {
  return (
    <section className="case-terminal ss-card scene-transition">
      <div className="case-terminal-header">
        <span>ROOM S109 - YOUR WORKSTATION</span>
        <span>DAY 8 - 16:20</span>
      </div>
      <div className="case-os-bar">
        <span>UNIT ZERO OS v4.2</span>
        <span>{internName.toLowerCase()}@unitzero.gov - CASE DIGITISATION</span>
      </div>
      <h2 className="case-os-welcome">ONE WEEK LATER</h2>
      <p className="case-os-subtitle">
        OLD CASE FILES INDEXED: 73% - ENCRYPTED FOLDER ACCESS PENDING.
      </p>
      <div className="case-desktop-grid">
        {['Archive', 'Scanner', 'Mail', 'Case Logs', 'Chat', 'Security'].map(
          (item) => (
            <div
              key={item}
              className={`case-desktop-tile ${item === 'Mail' ? 'active' : ''}`}
            >
              <span
                className={`desktop-pixel-icon icon-${
                  item === 'Mail' ? 'mail' : item === 'Chat' ? 'chat' : 'folder'
                }`}
              />
              <span>{item}</span>
            </div>
          ),
        )}
      </div>
      <div className="jane-message">
        <strong>System note:</strong> Digitisation project moved to encrypted
        case storage. Supervisor approvals required for new folders.
      </div>
      <div className="case-inbox-label">INBOX (1 NEW)</div>
      <div className="case-inbox-row active">
        Re: Case File Access - Action Required
      </div>
      <button type="button" className="ss-btn ss-btn-cyan mt-4" onClick={onNext}>
        Open Email
      </button>
    </section>
  )
}

function VeteranEmail({ onClickLink, onHoverLink, onMessageZoey, internName }) {
  return (
    <section className="case-email ss-card scene-transition">
      <div className="voucher-header veteran-email-header">
        Re: Case File Access - Action Required
      </div>
      <div className="email-meta">
        <span>From:</span> agentzoey.a@unitzero.gov
      </div>
      <div className="email-meta">
        <span>To:</span> {internName.toLowerCase()}@unitzero.gov
      </div>
      <div className="email-meta">
        <span>Subject:</span> Re: Case File Access - Action Required
      </div>
      <div className="fake-hr-stamp veteran-stamp">UNIT ZERO SECURE FILES</div>
      <p>Hey, I noticed you've been working on the digitisation project.</p>
      <p>
        I'm sharing a secure link to the encrypted case folder. You'll need to
        log in to verify your access level before end of day - the system resets
        at midnight.
      </p>
      <p>Let me know once you're in.</p>
      <div className="veteran-link-preview">
        Secure case folder: secure.unitzero.gov.com/case-access
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button type="button" className="voucher-claim-btn" onClick={onClickLink}>
          Click the link
        </button>
        <button type="button" className="voucher-report-btn" onClick={onHoverLink}>
          Hover over the link
        </button>
        <button type="button" className="voucher-report-btn" onClick={onMessageZoey}>
          Message Agent Zoey
        </button>
      </div>
      <div className="case-choice-hint">
        Choose one of the options to click the link, hover over the link or contact Agent Zoey for confirmation.
      </div>
    </section>
  )
}

function VeteranPortal({ onSubmit }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    accessCode: '',
  })
  const canSubmit =
    credentials.username.trim() &&
    credentials.password.trim() &&
    credentials.accessCode.trim()

  function updateField(field, value) {
    setCredentials((current) => ({ ...current, [field]: value }))
  }

  return (
    <section className="case-form ss-card scene-transition">
      <h2 className="font-pixel text-sw-pink text-sm">Unit Zero Secure Access</h2>
      <p className="text-sw-text2">
        Verify your clearance to open the encrypted case folder.
      </p>
      <label>
        Unit Zero username
        <input
          className="ss-input"
          type="text"
          value={credentials.username}
          onChange={(event) => updateField('username', event.target.value)}
          placeholder="username"
        />
      </label>
      <label>
        Password
        <input
          className="ss-input"
          type="password"
          value={credentials.password}
          onChange={(event) => updateField('password', event.target.value)}
          placeholder="password"
        />
      </label>
      <label>
        Access code
        <input
          className="ss-input"
          type="text"
          value={credentials.accessCode}
          onChange={(event) => updateField('accessCode', event.target.value)}
          placeholder="access code"
        />
      </label>
      <button
        type="button"
        className="ss-btn ss-btn-red"
        onClick={onSubmit}
        disabled={!canSubmit}
      >
        Verify Access
      </button>
    </section>
  )
}

function AccessConfirmed({ onNext }) {
  return (
    <section className="case-form ss-card scene-transition veteran-access-confirmed">
      <span className="font-pixel text-sw-cyan text-sm">SECURE ACCESS</span>
      <h2 className="font-pixel text-sw-pink text-sm">
        Access confirmed. Thank you.
      </h2>
      <p>
        Your clearance has been verified. The encrypted case folder will sync
        shortly.
      </p>
      <button type="button" className="ss-btn ss-btn-cyan self-start" onClick={onNext}>
        Return to workstation
      </button>
    </section>
  )
}

function OneHourLater({ onNext }) {
  useEffect(() => {
    playSfx('missionBriefing')
  }, [])

  return (
    <section className="case-glitch ss-card scene-transition veteran-time-skip">
      <div className="veteran-clock" aria-hidden="true">
        <span />
      </div>
      <h2 className="font-pixel text-sw-cyan text-sm">1 hour later...</h2>
      <p>Unit Zero internal alerts begin tracing unusual case-folder access.</p>
      <button type="button" className="ss-btn ss-btn-pink" onClick={onNext}>
        Enter Zoey's office
      </button>
    </section>
  )
}

function DomainCheck({ selectedAnswer, onAnswer, onNext, onWrongAnswer }) {
  const answered = selectedAnswer !== null
  const correct = selectedAnswer === 'no'

  function chooseAnswer(answer) {
    onAnswer(answer)
    if (answer === 'yes') onWrongAnswer()
  }

  return (
    <section className="case-email ss-card scene-transition">
      <div className="voucher-header veteran-email-header">LINK INSPECTION</div>
      <p className="text-sw-text2">Hover preview reveals:</p>
      <div className="veteran-domain-display">https://secure.unitzero.gov.co/login</div>
      <h3 className="font-pixel text-sw-cyan text-sm">
        Is this the real Unit Zero website?
      </h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          className="ss-btn ss-btn-pink"
          onClick={() => chooseAnswer('yes')}
          disabled={answered}
        >
          Yes
        </button>
        <button
          type="button"
          className="ss-btn ss-btn-cyan"
          onClick={() => chooseAnswer('no')}
          disabled={answered}
        >
          No
        </button>
      </div>
      {answered && (
        <div className={correct ? 'success-banner' : 'breach-banner'}>
          {correct
            ? 'Correct. unitzero.gov.co is a lookalike domain.'
            : 'Not quite. unitzero.gov.co is not the Unit Zero domain.'}
        </div>
      )}
      {answered && (
        <p className="text-sw-text2">
          unitzero.gov.co is not the same as unitzero.gov.com. Attackers register
          close-looking domains so the link feels familiar at a glance.
        </p>
      )}
      {answered && (
        <button type="button" className="ss-btn ss-btn-cyan self-start" onClick={onNext}>
          Continue trace
        </button>
      )}
    </section>
  )
}

function ZoeyOfficeReveal({ route, onNext, internName }) {
  const captured = route === 'captured'

  return (
    <section className="case-scene scene-transition">
      <div className="case-scene-top">
        <span>AGENT ZOEY'S OFFICE</span>
        <span>DAY 8 - 17:25</span>
      </div>

      <div className="case-office veteran-office">
        <div className="case-window case-window-left">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="unit-poster unit-poster-right">
          UNIT ZERO
          <br />
          INCIDENT ROOM
        </div>

        <PixelPerson
          role="intern"
          label={`${internName} - YOU`}
          position="pixel-intern-left"
        />
        <div className="veteran-zoey-real">
          <PixelPerson role="zoey" label="REAL ZOEY" />
        </div>
        {captured && (
          <div className="veteran-fake-zoey-terminal">
            <div className="veteran-fake-screen">agentzoey.a</div>
            <div className="veteran-fake-caption">EMAIL IMPOSTOR</div>
          </div>
        )}

        <div className="case-bubble case-bubble-jane veteran-zoey-bubble">
          <span className="text-sw-yellow">Agent Zoey</span>
          {captured ? (
            <p>
              I did not send that login request. The portal confirmation was the
              trap closing.
            </p>
          ) : route === 'hover' ? (
            <p>
              You paused before clicking and found the lookalike domain. That
              gave us a clean lead.
            </p>
          ) : (
            <p>
              I did not send that email. Verifying directly kept the attacker
              out of your account.
            </p>
          )}
        </div>
      </div>

      <blockquote className="zoey-quote">
        "This one was designed by professionals, Cadet. You weren't careless -
        you were targeted. That's the difference between a rookie mistake and a
        real threat. Now we have a problem to fix."
      </blockquote>

      <button
        type="button"
        className="ss-btn ss-btn-cyan self-end"
        onClick={onNext}
      >
        Trace the attack <IconArrowRight size={16} />
      </button>
    </section>
  )
}

function TracePuzzle({ selected, onToggle, onSubmit, submitted }) {
  const selectedSet = new Set(selected)
  const correctCount = TRACE_INDICATORS.filter(
    (item) => item.suspicious && selectedSet.has(item.id),
  ).length
  const falsePositives = TRACE_INDICATORS.filter(
    (item) => !item.suspicious && selectedSet.has(item.id),
  ).length
  const passed = correctCount === 3 && falsePositives === 0
  const ready = selected.length === 3

  return (
    <section className="case-terminal ss-card scene-transition">
      <div className="case-terminal-header">
        <span>AGENT ZOEY - TRACE DESK</span>
        <span>INDICATORS OF COMPROMISE</span>
      </div>
      <h2 className="font-pixel text-sw-cyan text-sm">
        Trace the phishing attempt
      </h2>
      <p className="text-sw-text2">
        Zoey has pulled five log fragments from the email gateway. Select the
        three technical indicators that prove this was a phishing attack, then
        submit your trace report.
      </p>
      <div className="veteran-trace-status">
        Selected {selected.length}/3 indicators
      </div>
      <div className="veteran-log-list">
        {TRACE_INDICATORS.map((item) => {
          const selectedItem = selectedSet.has(item.id)
          const rowState = submitted
            ? item.suspicious
              ? selectedItem
                ? 'veteran-log-row-correct'
                : 'veteran-log-row-missed'
              : selectedItem
                ? 'veteran-log-row-decoy'
                : 'veteran-log-row-neutral'
            : ''

          return (
            <button
              key={item.id}
              type="button"
              className={`veteran-log-row ${
                selectedItem ? 'veteran-log-row-selected' : ''
              } ${rowState}`}
              onClick={() => onToggle(item.id)}
              disabled={submitted}
            >
              <span>{item.label}</span>
              {submitted && (
                <small>
                  {item.suspicious
                    ? selectedItem
                      ? 'Confirmed IOC: '
                      : 'Missed IOC: '
                    : selectedItem
                      ? 'Decoy selected: '
                      : 'Context only: '}
                  {item.detail}
                </small>
              )}
            </button>
          )
        })}
      </div>
      {submitted && (
        <div className={passed ? 'success-banner' : 'breach-banner'}>
          {passed
            ? 'Trace complete. The reply-to, link host, and source reputation identify the attack path.'
            : 'Trace reviewed. Zoey marks the true IOCs before the final certification.'}
        </div>
      )}
      {submitted && (
        <p className="text-sw-text2">
          The useful evidence is technical: where replies go, where the link
          actually lands, and what the sending infrastructure has done before.
          Familiar names and convenient timing can mislead you, but they do not
          prove the attack on their own.
        </p>
      )}
      <button
        type="button"
        className="ss-btn ss-btn-cyan self-start"
        onClick={onSubmit}
        disabled={!submitted && !ready}
      >
        {submitted ? 'Begin final certification' : 'Submit trace report'}
      </button>
    </section>
  )
}

function VeteranQuiz({
  answers,
  currentQuestionIndex,
  onAnswer,
  onNextQuestion,
  onSubmit,
  submitted,
}) {
  const correct = answers.reduce(
    (count, answer, index) => count + (answer === VETERAN_QUIZ[index].answer ? 1 : 0),
    0,
  )
  const currentQuestion = VETERAN_QUIZ[currentQuestionIndex]
  const selectedAnswer = answers[currentQuestionIndex]
  const answered = selectedAnswer !== null
  const selectedCorrect = selectedAnswer === currentQuestion.answer
  const isLastQuestion = currentQuestionIndex === VETERAN_QUIZ.length - 1
  const passed = correct >= 5

  return (
    <section className="case-debrief scene-transition">
      <div className="success-banner">FINAL CERTIFICATION - PHISHING FIELD GUIDE</div>
      <div className="ss-card p-5 flex flex-col gap-4">
        <h2 className="font-pixel text-sw-cyan text-sm">
          Case 01 final debrief
        </h2>
        <p className="text-sw-text2">
          This wraps the Rookie bait email and the Veteran double bluff. Each
          correct answer is worth 10 coins. Passing requires 5 or more correct
          answers and closes the phishing case arc.
        </p>
        {!submitted ? (
          <>
            <div className="veteran-quiz-progress">
              Question {currentQuestionIndex + 1} / {VETERAN_QUIZ.length}
            </div>
            <article
              className={`veteran-quiz-card veteran-quiz-focus ${
                answered && !selectedCorrect ? 'veteran-quiz-shake' : ''
              }`}
            >
              <h3>{currentQuestion.question}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentQuestion.options.map((option, optionIndex) => {
                  const selected = selectedAnswer === optionIndex
                  const isCorrect = currentQuestion.answer === optionIndex
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`veteran-answer-btn ${
                        selected ? 'veteran-answer-selected' : ''
                      } ${
                        answered && isCorrect ? 'veteran-answer-correct' : ''
                      } ${
                        answered && selected && !isCorrect
                          ? 'veteran-answer-wrong'
                          : ''
                      }`}
                      onClick={() => onAnswer(currentQuestionIndex, optionIndex)}
                      disabled={answered}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </article>
            {answered && (
              <div className={selectedCorrect ? 'success-banner' : 'breach-banner'}>
                {selectedCorrect
                  ? 'Correct. +10 quiz coins secured.'
                  : `Not this time. Correct answer: ${
                      currentQuestion.options[currentQuestion.answer]
                    }`}
              </div>
            )}
            {answered && (
              <button
                type="button"
                className="ss-btn ss-btn-cyan self-start"
                onClick={isLastQuestion ? onSubmit : onNextQuestion}
              >
                {isLastQuestion ? 'View results' : 'Next Question'}
              </button>
            )}
          </>
        ) : (
          <>
            <div className={passed ? 'success-banner' : 'breach-banner'}>
              {passed ? 'Certification passed' : 'Certification failed'}
            </div>
            <div className="veteran-results-grid">
              <div>
                <span>Correct</span>
                <strong>{correct} / 10</strong>
              </div>
              <div>
                <span>Quiz coins</span>
                <strong>{correct * 10}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{passed ? 'Replay optional' : 'Replay required'}</strong>
              </div>
            </div>
            <p className="text-sw-text2">
              {passed
                ? 'You have enough field evidence and quiz score to close the Veteran phishing case.'
                : 'More than half the answers were missed. Replay the Veteran level before this case can close.'}
            </p>
            <button
              type="button"
              className="ss-btn ss-btn-cyan self-start"
              onClick={onSubmit}
            >
              Continue debrief
            </button>
          </>
        )}
      </div>
    </section>
  )
}

function VeteranDebrief({
  route,
  quizCorrect,
  quizSubmitted,
  onReplay,
  onContinue,
  busy,
}) {
  const passed = quizSubmitted && quizCorrect >= 5
  const failedRoute = route === 'captured'
  const fieldFailed = route === 'fieldFailed'
  const quizFailed = route === 'quizFailed'

  return (
    <section className="case-debrief">
      <div className={passed && !failedRoute && !fieldFailed && !quizFailed ? 'success-banner' : 'breach-banner'}>
        {passed && !failedRoute && !fieldFailed && !quizFailed
          ? 'CASE 01 VETERAN SECURED'
          : failedRoute
            ? 'CREDENTIAL CAPTURE - REPLAY REQUIRED'
            : fieldFailed
              ? 'FIELD TRACE FAILED - REPLAY REQUIRED'
              : quizFailed
                ? 'FINAL QUIZ FAILED - REPLAY REQUIRED'
                : 'FIELD CHECK FAILED - REPLAY REQUIRED'}
      </div>
      <div className="ss-card p-5 flex flex-col gap-4">
        <div>
          <h2 className="font-pixel text-sw-cyan text-sm">
            CASE 01 VETERAN: THE DOUBLE BLUFF
          </h2>
          <p className="text-sw-text2">
            {passed && !failedRoute && !fieldFailed && !quizFailed
              ? 'You verified the request, traced the infrastructure, and passed the field check.'
              : fieldFailed
                ? 'The trace report missed the attack path. Review the indicators before retrying the Veteran investigation.'
                : quizFailed
                  ? 'The final certification score was below 50%. Replay is required before the Veteran case can close.'
                  : 'Review the professional phishing indicators before retrying the Veteran case.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {VETERAN_LESSONS.map((lesson) => (
            <article key={lesson.title} className="red-flag-card">
              <IconFlag size={18} />
              <div>
                <h3>{lesson.title}</h3>
                <p>{lesson.text}</p>
              </div>
            </article>
          ))}
        </div>
        {passed && !failedRoute && !fieldFailed && !quizFailed && (
          <>
            <div className="badge-card">
              <span>Badge unlocked</span>
              <strong>BURNED TWICE, WISER ONCE</strong>
            </div>
            <div className="badge-card">
              <span>Field guide unlocked</span>
              <strong>PHISHING FIELD GUIDE</strong>
            </div>
          </>
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
            Continue to Case Files
          </button>
        </div>
      </div>
    </section>
  )
}

function VeteranEndScreen({ badge, pointsAwarded, quizCorrect, onReturn, onReplay }) {
  return (
    <section className="ss-card p-6 flex flex-col gap-4">
      <h2 className="font-pixel text-sw-cyan text-sm">
        Case 01 Veteran Complete
      </h2>
      <p className="text-sw-text2">
        The Double Bluff closed. Quiz score: {quizCorrect}/10.
      </p>
      <PixelBadgeCard badge={badge} pointsAwarded={pointsAwarded} />
      <div className="badge-card">
        <span>Reference unlock</span>
        <strong>PHISHING FIELD GUIDE</strong>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" className="ss-btn ss-btn-cyan" onClick={onReturn}>
          Return to Case Files
        </button>
        <button type="button" className="ss-btn ss-btn-pink" onClick={onReplay}>
          Replay Veteran
        </button>
      </div>
    </section>
  )
}

function VeteranCase() {
  const navigate = useNavigate()
  const { user, token, setUser } = useAuth()
  const [phase, setPhase] = useState('inbox')
  const [route, setRoute] = useState(null)
  const [domainAnswer, setDomainAnswer] = useState(null)
  const [traceSelected, setTraceSelected] = useState([])
  const [traceSubmitted, setTraceSubmitted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState(
    () => VETERAN_QUIZ.map(() => null),
  )
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [badge, setBadge] = useState(null)
  const [pointsAwarded, setPointsAwarded] = useState(0)
  const [progressError, setProgressError] = useState('')
  const [resolvingDebrief, setResolvingDebrief] = useState(false)
  const resolvingRef = useRef(false)
  const internName = user?.username || 'Nova'
  const quizCorrect = quizAnswers.reduce(
    (count, answer, index) => count + (answer === VETERAN_QUIZ[index].answer ? 1 : 0),
    0,
  )
  const selectedTraceSet = new Set(traceSelected)
  const tracePassed =
    traceSubmitted &&
    TRACE_INDICATORS.every(
      (item) => selectedTraceSet.has(item.id) === item.suspicious,
    )
  const failedOutcome =
    route === 'captured' || route === 'fieldFailed' || route === 'quizFailed'
  const passedVeteran = !failedOutcome && quizSubmitted && quizCorrect >= 5

  function restart() {
    setPhase('inbox')
    setRoute(null)
    setDomainAnswer(null)
    setTraceSelected([])
    setTraceSubmitted(false)
    setQuizAnswers(VETERAN_QUIZ.map(() => null))
    setCurrentQuizQuestion(0)
    setQuizSubmitted(false)
    setBadge(null)
    setPointsAwarded(0)
    setProgressError('')
    setResolvingDebrief(false)
    resolvingRef.current = false
  }

  async function spendFailureLife(nextAction) {
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const data = await api.failAttempt(token, {
        caseId: 1,
        difficulty: 'veteran',
      })
      setUser(data.user)
      playSfx('lifeLost')
      playSfx('caseFailed')
      if (nextAction === 'replay') {
        restart()
        return
      }
      navigate('/play')
    } catch (error) {
      console.error('[progress] Veteran failed attempt update failed', {
        endpoint: '/progress/fail-attempt',
        caseId: 1,
        difficulty: 'veteran',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update lives.')
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  async function finishVeteran(nextAction = 'end') {
    if (!passedVeteran) {
      if (failedOutcome) spendFailureLife('replay')
      else restart()
      return
    }
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const unlockedBadge = BADGES.burnedTwice
      const data = await api.completeCase(token, {
        caseId: 1,
        difficulty: 'veteran',
        result: 'success',
        badge: unlockedBadge,
        bonusPoints: quizCorrect * 10,
      })
      setUser(data.user)
      setBadge(unlockedBadge)
      setPointsAwarded(data.pointsAwarded)
      if (data.pointsAwarded > 0) {
        playSfx('coins')
        playSfx('badge')
      }
      playSfx('caseComplete')
      if (nextAction === 'caseFiles') {
        navigate('/play')
        return
      }
      setPhase('end')
    } catch (error) {
      console.error('[progress] Veteran completion update failed', {
        endpoint: '/progress/complete-case',
        caseId: 1,
        difficulty: 'veteran',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update case progress.')
    } finally {
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  function toggleTrace(id) {
    setTraceSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  function submitTrace() {
    if (!traceSubmitted) {
      setTraceSubmitted(true)
      return
    }
    if (!tracePassed) {
      setRoute('fieldFailed')
      setPhase('debrief')
      return
    }
    setPhase('quiz')
  }

  function answerQuiz(questionIndex, optionIndex) {
    if (quizAnswers[questionIndex] !== null) return
    setQuizAnswers((current) =>
      current.map((answer, index) =>
        index === questionIndex ? optionIndex : answer,
      ),
    )
    playSfx(
      optionIndex === VETERAN_QUIZ[questionIndex].answer ? 'correct' : 'wrong',
    )
  }

  function nextQuizQuestion() {
    setCurrentQuizQuestion((value) =>
      Math.min(value + 1, VETERAN_QUIZ.length - 1),
    )
  }

  function submitQuiz() {
    if (!quizSubmitted) {
      setQuizSubmitted(true)
      return
    }
    if (quizCorrect < 5) setRoute('quizFailed')
    setPhase('debrief')
  }

  return (
    <div className="case-shell max-w-5xl mx-auto">
      <div className="case-title-row">
        <div>
          <span className="font-pixel text-sw-pink text-xs">CASE 01 VETERAN</span>
          <h2 className="font-pixel text-sw-cyan text-sm md:text-base">
            The Double Bluff
          </h2>
        </div>
      </div>
      {progressError && (
        <div className="ss-card p-3 text-sw-red text-sm">{progressError}</div>
      )}

      {phase === 'inbox' && (
        <VeteranInbox
          internName={internName}
          onNext={() => setPhase('email')}
        />
      )}
      {phase === 'email' && (
        <VeteranEmail
          internName={internName}
          onClickLink={() => setPhase('portal')}
          onHoverLink={() => {
            setRoute('hover')
            setPhase('domain')
          }}
          onMessageZoey={() => {
            setRoute('message')
            setPhase('timeSkip')
          }}
        />
      )}
      {phase === 'portal' && (
        <VeteranPortal
          onSubmit={() => {
            setRoute('captured')
            setPhase('accessConfirmed')
          }}
        />
      )}
      {phase === 'accessConfirmed' && (
        <AccessConfirmed onNext={() => setPhase('timeSkip')} />
      )}
      {phase === 'timeSkip' && (
        <OneHourLater onNext={() => setPhase('zoey')} />
      )}
      {phase === 'domain' && (
        <DomainCheck
          selectedAnswer={domainAnswer}
          onAnswer={setDomainAnswer}
          onWrongAnswer={() => {
            setRoute('captured')
            setPhase('portal')
          }}
          onNext={() => setPhase('timeSkip')}
        />
      )}
      {phase === 'zoey' && (
        <ZoeyOfficeReveal
          route={route}
          internName={internName}
          onNext={() => setPhase('trace')}
        />
      )}
      {phase === 'trace' && (
        <TracePuzzle
          selected={traceSelected}
          onToggle={toggleTrace}
          onSubmit={submitTrace}
          submitted={traceSubmitted}
        />
      )}
      {phase === 'quiz' && (
        <VeteranQuiz
          answers={quizAnswers}
          currentQuestionIndex={currentQuizQuestion}
          onAnswer={answerQuiz}
          onNextQuestion={nextQuizQuestion}
          onSubmit={submitQuiz}
          submitted={quizSubmitted}
        />
      )}
      {phase === 'debrief' && (
        <VeteranDebrief
          route={route}
          quizCorrect={quizCorrect}
          quizSubmitted={quizSubmitted}
          onReplay={
            passedVeteran || !failedOutcome
              ? restart
              : () => spendFailureLife('replay')
          }
          onContinue={
            passedVeteran
              ? () => finishVeteran('caseFiles')
              : failedOutcome
                ? () => spendFailureLife('continue')
                : () => navigate('/play')
          }
          busy={resolvingDebrief}
        />
      )}
      {phase === 'end' && (
        <VeteranEndScreen
          badge={badge}
          pointsAwarded={pointsAwarded}
          quizCorrect={quizCorrect}
          onReturn={() => navigate('/play')}
          onReplay={restart}
        />
      )}
    </div>
  )
}

function Case2Intro({ internName, onNext }) {
  return (
    <section className="case-terminal ss-card scene-transition">
      <div className="case-terminal-header">
        <span>UNIT ZERO</span>
        <span>DAY 14 - 09:18</span>
      </div>
      <div className="case-os-bar">
        <span>ROOKIE CASE - SOCIAL THREADS</span>
        <span>{internName.toLowerCase()}@unitzero.gov - ACTIVE</span>
      </div>
      <div className="case2-intro-grid">
        <div className="case2-social-stack" aria-hidden="true">
          <div className="case2-ambient-comment ambient-one">@nina: oh nvm</div>
          <div className="case2-ambient-comment ambient-two">seen by 5</div>
          <div className="case2-ambient-comment ambient-three">@mika: inside joke</div>
          <div className="case2-phone-frame">
            <span className="case2-phone-notch" />
            <div className="case2-post-card case2-floating-comment">
              <strong>@emma.draws</strong>
              <p>did everyone leave the old chat?</p>
              <span className="case2-post-meta">sent 18:42</span>
            </div>
            <div className="case2-post-card muted case2-floating-comment">
              <strong>@johnhaha67</strong>
              <p>lol</p>
              <span className="case2-post-meta">1 reply</span>
            </div>
            <div className="case2-typing-row">
              <span />
              <span />
              <span />
            </div>
            <div className="case2-feed-fragment fragment-one">seen by 5</div>
            <div className="case2-feed-fragment fragment-two">reply deleted</div>
          </div>
        </div>
        <div className="case2-ricky-panel">
          <span className="font-pixel text-sw-yellow text-xs">AGENT RICKY</span>
          <h2 className="font-pixel text-sw-cyan text-sm">The Network: Just Jokes</h2>
          <p className="case2-briefing-type">
            Emma sent over a quiet note after a week on GlowLoop. It does not
            look dramatic: comments, group chats, a few deleted replies.
          </p>
          <p className="text-sw-text3">
            Read each thread, then decide. Some are normal awkward moments.
            Some are not.
          </p>
          <button type="button" className="ss-btn ss-btn-cyan self-start" onClick={onNext}>
            Start Reading <IconArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}

function Case2QueueList({ activeIndex, decisions, onOpen }) {
  return (
    <aside className="case2-queue-panel">
      <div className="case2-queue-title">
        <span>THREADS</span>
        <strong>{CASE2_THREADS.length}</strong>
      </div>
      {CASE2_THREADS.map((thread, index) => (
        <button
          key={thread.id}
          type="button"
          className={`case2-queue-item ${index === activeIndex ? 'active' : ''} ${
            decisions[thread.id] ? 'resolved' : ''
          }`}
          onClick={() => onOpen(index)}
        >
          <span>{thread.moment}</span>
          <strong>{thread.place}</strong>
          <em>{decisions[thread.id] ? decisions[thread.id] : 'unread'}</em>
        </button>
      ))}
    </aside>
  )
}

function Case2ThreadFile({
  thread,
  index,
  total,
  decision,
  processing,
  onDecision,
  onNext,
}) {
  const canAdvance = Boolean(decision) && !processing

  return (
    <article className="case2-file scene-transition">
      <div className="case2-file-top">
        <div>
          <span className="font-pixel text-sw-pink text-xs">
            THREAD {index + 1} OF {total}
          </span>
          <h3>{thread.title}</h3>
          <p>{thread.moment} - {thread.source}</p>
        </div>
      </div>

      <div className="case2-file-grid">
        <section className="case2-social-window">
          <div className="case2-social-window-bar">
            <span>GlowLoop</span>
            <span>{thread.place}</span>
          </div>
          <div className="case2-message-list case2-message-focus">
            {thread.messages.map((message, messageIndex) => (
              <div
                key={`${thread.id}-${messageIndex}`}
                className="case2-message case2-post-message"
              >
                <div className="case2-avatar" aria-hidden="true">
                  {message.author.slice(1, 3).toUpperCase()}
                </div>
                <div>
                  <strong>{message.author}</strong>
                  <p>{message.text}</p>
                  {message.time && <em>{message.time}</em>}
                  <div className="case2-message-social">
                    <span>{message.likes ?? messageIndex + 1} likes</span>
                    <span>{message.replies ?? 0} replies</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="case2-action-console">
        <div className="case2-decision-row" role="group" aria-label={`${thread.title} decision`}>
          <button
            type="button"
            className={`case2-decision-btn case2-flag-btn ${
              decision === 'flag' ? 'selected' : ''
            }`}
            onClick={() => onDecision(thread.id, 'flag')}
            disabled={processing || Boolean(decision)}
          >
            FLAG
          </button>
          <button
            type="button"
            className={`case2-decision-btn case2-dismiss-btn ${
              decision === 'dismiss' ? 'selected' : ''
            }`}
            onClick={() => onDecision(thread.id, 'dismiss')}
            disabled={processing || Boolean(decision)}
          >
            DISMISS
          </button>
        </div>
        <button
          type="button"
          className="ss-btn ss-btn-cyan"
          onClick={onNext}
          disabled={!canAdvance}
        >
          {index === total - 1 ? 'Submit' : 'Next Thread'} <IconArrowRight size={16} />
        </button>
      </div>
    </article>
  )
}

function Case2ReviewBoard({
  decisions,
  activeIndex,
  processing,
  onOpen,
  onDecision,
  onNext,
}) {
  const answeredCount = CASE2_THREADS.filter((thread) => decisions[thread.id]).length
  const activeThread = CASE2_THREADS[activeIndex]

  return (
    <section className="case2-board scene-transition">
      <div className="case2-board-header">
        <div>
          <span className="font-pixel text-sw-pink text-xs">GLOWLOOP THREADS</span>
          <h2 className="font-pixel text-sw-cyan text-sm">Read and Decide</h2>
        </div>
        <div className="case2-progress-chip">
          {answeredCount} / {CASE2_THREADS.length}
        </div>
      </div>

      <div className="case2-briefing-strip">
        <strong>Agent Ricky:</strong> Read the thread, then choose flag or
        dismiss. Do not overthink the interface. Pay attention to the people.
      </div>

      <div className="case2-thread-layout">
        <Case2QueueList
          activeIndex={activeIndex}
          decisions={decisions}
          onOpen={onOpen}
        />
        <Case2ThreadFile
          thread={activeThread}
          index={activeIndex}
          total={CASE2_THREADS.length}
          decision={decisions[activeThread.id]}
          processing={processing}
          onDecision={onDecision}
          onNext={onNext}
        />
      </div>
    </section>
  )
}

function Case2Debrief({
  correctCount,
  missedGroupExclusion,
  missedPlausibleDeniability,
  flaggedEverything,
  passed,
  decisions,
  onReplay,
  onContinue,
  busy,
}) {
  const wrongThreads = CASE2_THREADS.filter(
    (thread) => decisions[thread.id] !== thread.correctAction,
  )

  return (
    <section className="case-debrief scene-transition">
      <div className={passed ? 'success-banner' : 'breach-banner'}>
        {passed ? 'PATTERN FOUND - AFTERWARD' : 'PATTERN UNCLEAR - AFTERWARD'}
      </div>
      <div className="ss-card p-5 flex flex-col gap-4">
        <div className="case2-ricky-panel">
          <span className="font-pixel text-sw-yellow text-xs">AGENT RICKY</span>
          <h2 className="font-pixel text-sw-cyan text-sm">What changed after you read it all</h2>
          <p>
            You read {correctCount} / {CASE2_THREADS.length} moments the way
            Emma experienced them.{' '}
            {passed
              ? 'The harm was not in one dramatic post. It was in the pattern that kept returning to her.'
              : 'The week needs another read before the pattern is clear.'}
          </p>
          {missedGroupExclusion && (
            <blockquote className="zoey-quote">
              "You caught the easy ones. You missed the one that broke her.
              Look at the timeline, Cadet. Emma did not lose friends in one big
              fight. They just quietly stopped including her. Every single day.
              That is not banter - that is a campaign."
            </blockquote>
          )}
          {missedPlausibleDeniability && (
            <blockquote className="zoey-quote">
              "Sometimes harassment hides behind tiny comments. 'lol' once
              might mean nothing. 'lol' under every post, always from the same
              person, always aimed at Emma, becomes a pattern."
            </blockquote>
          )}
          {flaggedEverything && (
            <blockquote className="zoey-quote">
              "Flagging everything feels safe, but it blurs the difference
              between harm and ordinary conflict. Cyberbullying depends on
              repetition, targeting, power imbalance, and harm. Normal
              disagreement still needs room to exist."
            </blockquote>
          )}
        </div>

        <div className="case2-score-grid">
          {CASE2_THREADS.map((thread) => {
            const correct = decisions[thread.id] === thread.correctAction
            return (
              <article
                key={thread.id}
                className={`red-flag-card ${correct ? 'case2-correct' : 'case2-wrong'}`}
              >
                <IconFlag size={18} />
                <div>
                  <h3>
                    {correct
                      ? thread.correctAction === 'flag'
                        ? 'Correct flag'
                        : 'Correct dismiss'
                      : thread.correctAction === 'flag'
                        ? 'Easy to dismiss at first'
                        : 'Not bullying'}
                  </h3>
                  <p>{thread.explanation}</p>
                </div>
              </article>
            )
          })}
        </div>

        {wrongThreads.length > 0 && (
          <p className="text-sw-text3 text-sm">
            Re-read: {wrongThreads.map((thread) => thread.title).join(', ')}.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CASE2_TEACHING_POINTS.map((point) => (
            <article key={point.title} className="red-flag-card">
              <IconFlag size={18} />
              <div>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </div>
            </article>
          ))}
        </div>

        {passed && (
          <div className="badge-card">
            <span>Badge unlocked</span>
            <strong>PATTERN RECOGNITION — BEGINNER</strong>
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
            {passed ? 'Continue' : 'Return to Case Files'}
          </button>
        </div>
      </div>
    </section>
  )
}

function Case2EndScreen({ badge, pointsAwarded, correctCount, onReturn, onVeteran }) {
  const quizCoins = correctCount * CASE2_DECISION_REWARD
  return (
    <section className="ss-card p-6 flex flex-col gap-4">
      <h2 className="font-pixel text-sw-cyan text-sm">Case 02 Rookie Complete</h2>
      <p className="text-sw-text2">
        Case notes filed. Rookie reward secured with {quizCoins} points.
      </p>
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

function Case2Rookie() {
  const navigate = useNavigate()
  const { user, token, setUser } = useAuth()
  const [phase, setPhase] = useState('intro')
  const [decisions, setDecisions] = useState({})
  const [activeThreadIndex, setActiveThreadIndex] = useState(0)
  const [processingDecision, setProcessingDecision] = useState(false)
  const [badge, setBadge] = useState(null)
  const [pointsAwarded, setPointsAwarded] = useState(0)
  const [progressError, setProgressError] = useState('')
  const [resolvingDebrief, setResolvingDebrief] = useState(false)
  const resolvingRef = useRef(false)
  const internName = user?.username || 'Nova'
  const correctCount = CASE2_THREADS.reduce(
    (count, thread) =>
      count + (decisions[thread.id] === thread.correctAction ? 1 : 0),
    0,
  )
  const subtleCorrectCount = ['group-exclusion', 'plausible-deniability'].reduce(
    (count, id) => count + (decisions[id] === 'flag' ? 1 : 0),
    0,
  )
  const passed = correctCount >= CASE2_PASS_THRESHOLD && subtleCorrectCount >= 1
  const missedGroupExclusion =
    decisions['group-exclusion'] && decisions['group-exclusion'] !== 'flag'
  const missedPlausibleDeniability =
    decisions['plausible-deniability'] &&
    decisions['plausible-deniability'] !== 'flag'
  const flaggedEverything =
    CASE2_THREADS.length > 0 &&
    CASE2_THREADS.every((thread) => decisions[thread.id] === 'flag')

  function restart() {
    setPhase('intro')
    setDecisions({})
    setActiveThreadIndex(0)
    setProcessingDecision(false)
    setBadge(null)
    setPointsAwarded(0)
    setProgressError('')
    setResolvingDebrief(false)
    resolvingRef.current = false
  }

  function setDecision(threadId, action) {
    if (processingDecision || decisions[threadId]) return
    playSfx('click')
    setProcessingDecision(true)
    window.setTimeout(() => {
      setDecisions((current) => ({ ...current, [threadId]: action }))
      playSfx('click')
      setProcessingDecision(false)
    }, 720)
  }

  function openThread(index) {
    if (processingDecision) return
    setActiveThreadIndex(index)
  }

  function nextThreadOrSubmit() {
    if (processingDecision) return
    const activeThread = CASE2_THREADS[activeThreadIndex]
    if (!decisions[activeThread.id]) return
    if (activeThreadIndex < CASE2_THREADS.length - 1) {
      setActiveThreadIndex((value) => value + 1)
      playSfx('click')
      return
    }
    if (Object.keys(decisions).length !== CASE2_THREADS.length) {
      const firstUnresolved = CASE2_THREADS.findIndex((thread) => !decisions[thread.id])
      if (firstUnresolved >= 0) {
        setActiveThreadIndex(firstUnresolved)
      }
      return
    }
    playSfx(passed ? 'correct' : 'wrong')
    setPhase('debrief')
  }

  async function spendFailureLife(nextAction) {
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const data = await api.failAttempt(token, {
        caseId: 2,
        difficulty: 'rookie',
      })
      setUser(data.user)
      playSfx('lifeLost')
      playSfx('caseFailed')
      if (nextAction === 'replay') {
        restart()
        return
      }
      navigate('/play')
    } catch (error) {
      console.error('[progress] Case 2 failed attempt update failed', {
        endpoint: '/progress/fail-attempt',
        caseId: 2,
        difficulty: 'rookie',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update lives.')
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  async function finishRookie(nextAction = 'end') {
    if (!passed) {
      spendFailureLife(nextAction === 'replay' ? 'replay' : 'continue')
      return
    }
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const unlockedBadge = BADGES.patternBeginner
      const data = await api.completeCase(token, {
        caseId: 2,
        difficulty: 'rookie',
        result: 'success',
        badge: unlockedBadge,
        bonusPoints: correctCount * CASE2_DECISION_REWARD,
      })
      setUser(data.user)
      setBadge(unlockedBadge)
      setPointsAwarded(data.pointsAwarded)
      if (data.pointsAwarded > 0) {
        playSfx('coins')
        playSfx('badge')
      }
      playSfx('caseComplete')
      if (nextAction === 'replay') {
        restart()
        return
      }
      if (nextAction === 'caseFiles') {
        navigate('/play')
        return
      }
      setPhase('end')
    } catch (error) {
      console.error('[progress] Case 2 completion update failed', {
        endpoint: '/progress/complete-case',
        caseId: 2,
        difficulty: 'rookie',
        message: error.message,
      })
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
          <span className="font-pixel text-sw-pink text-xs">CASE 02 ROOKIE</span>
          <h2 className="font-pixel text-sw-cyan text-sm md:text-base">
            The Network: Just Jokes
          </h2>
        </div>
      </div>
      {progressError && (
        <div className="ss-card p-3 text-sw-red text-sm">{progressError}</div>
      )}

      {phase === 'intro' && (
        <Case2Intro
          internName={internName}
          onNext={() => setPhase('review')}
        />
      )}
      {phase === 'review' && (
        <Case2ReviewBoard
          decisions={decisions}
          activeIndex={activeThreadIndex}
          processing={processingDecision}
          onOpen={openThread}
          onDecision={setDecision}
          onNext={nextThreadOrSubmit}
        />
      )}
      {phase === 'debrief' && (
        <Case2Debrief
          correctCount={correctCount}
          missedGroupExclusion={missedGroupExclusion}
          missedPlausibleDeniability={missedPlausibleDeniability}
          flaggedEverything={flaggedEverything}
          passed={passed}
          decisions={decisions}
          onReplay={passed ? () => finishRookie('replay') : () => spendFailureLife('replay')}
          onContinue={passed ? () => finishRookie('end') : () => spendFailureLife('continue')}
          busy={resolvingDebrief}
        />
      )}
      {phase === 'end' && (
        <Case2EndScreen
          badge={badge}
          pointsAwarded={pointsAwarded}
          correctCount={correctCount}
          onReturn={() => navigate('/play')}
          onVeteran={() => navigate('/case/2/veteran')}
        />
      )}
    </div>
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
  if (!isCaseModeUnlocked(user, numericCaseId, difficulty)) return <LockedCase />
  if (numericCaseId === 2 && difficulty === 'rookie') return <Case2Rookie />
  if (numericCaseId === 2) return <FutureCase caseId={numericCaseId} />
  if (numericCaseId !== 1) return <FutureCase caseId={numericCaseId} />
  if (difficulty === 'veteran') return <VeteranCase />

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
      playSfx('lifeLost')
      playSfx('caseFailed')
      if (nextAction === 'replay') {
        restart()
        return
      }
      navigate('/play')
    } catch (error) {
      console.error('[progress] Failed case attempt update failed', {
        endpoint: '/progress/fail-attempt',
        action: nextAction,
        caseId: numericCaseId,
        difficulty,
        message: error.message,
      })
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
    if (data.pointsAwarded > 0) {
      playSfx('coins')
      playSfx('badge')
    }
    playSfx('caseComplete')
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
      console.error('[progress] Successful replay progress update failed', {
        endpoint: '/progress/complete-case',
        caseId: numericCaseId,
        difficulty: 'rookie',
        message: error.message,
      })
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
      console.error('[progress] Case completion update failed', {
        endpoint: '/progress/complete-case',
        caseId: numericCaseId,
        difficulty: 'rookie',
        message: error.message,
      })
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
