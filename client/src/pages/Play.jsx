import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconLock } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext.jsx'

// The five cases. The case room itself (/case/:id) is owned by another
// team - this screen only lets the player pick one.
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

const DIFF_KEY = 'ss_play_difficulty'

// Case-select screen. Difficulty is device-local (localStorage); unlock
// state comes from user.casesSolved.
export default function Play() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [difficulty, setDifficulty] = useState(
    () => localStorage.getItem(DIFF_KEY) || 'rookie',
  )

  function setDiff(value) {
    setDifficulty(value)
    localStorage.setItem(DIFF_KEY, value)
  }

  const solved = user?.casesSolved ?? 0
  // Case 1 is always unlocked; case N unlocks once case N-1 is solved.
  const highestUnlocked = Math.max(1, solved + 1)

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-pixel text-sw-cyan text-glow text-base">
            CASE FILES
          </h2>
          <p className="text-sw-text3 mt-1">Select a case to investigate.</p>
        </div>

        {/* Difficulty toggle (Rookie / Veteran). */}
        <div
          className="ss-card flex p-1"
          role="radiogroup"
          aria-label="Difficulty"
        >
          {['rookie', 'veteran'].map((d) => (
            <button
              key={d}
              role="radio"
              aria-checked={difficulty === d}
              onClick={() => setDiff(d)}
              className={`px-4 py-1 rounded uppercase transition-colors ${
                difficulty === d ? 'text-sw-cyan' : 'text-sw-text3'
              }`}
              style={
                difficulty === d
                  ? { background: 'rgba(93,213,232,.15)' }
                  : undefined
              }
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CASES.map((c) => {
          const locked = c.id > highestUnlocked
          return (
            <button
              key={c.id}
              type="button"
              disabled={locked}
              onClick={() => navigate(`/case/${c.id}`)}
              className={`ss-card p-5 text-left flex flex-col gap-2 transition-colors ${
                locked
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-sw-cyan cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-pixel text-sw-pink text-xs">
                  CASE 0{c.id}
                </span>
                {locked && (
                  <IconLock size={18} className="text-sw-text3" stroke={1.5} />
                )}
              </div>
              <span className="font-pixel text-sw-cyan">{c.title}</span>
              <span className="text-sw-yellow text-sm">{c.theme}</span>
              <span className="text-sw-text2 text-sm mt-1">{c.desc}</span>
            </button>
          )
        })}
      </div>

      <p className="text-sw-text3 text-sm text-center">
        Difficulty:{' '}
        <span className="text-sw-cyan uppercase">{difficulty}</span> · Cases
        solved: {solved} / {CASES.length}
      </p>
    </div>
  )
}
