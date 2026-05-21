import { useState } from 'react'

// Single-answer multiple-choice question. After answering, the explanation
// (if provided) is shown along with the truth, then the player clicks
// Continue to advance to scene.next.
export default function MCQScene({ scene, onAdvance }) {
  const [picked, setPicked] = useState(null)

  function statusFor(i) {
    if (picked === null) return null
    if (i === scene.correctIndex) return 'correct'
    if (i === picked) return 'wrong'
    return null
  }

  return (
    <div className="ss-card p-6 flex flex-col gap-4">
      <h3 className="font-pixel text-sw-cyan text-sm">
        {scene.label || 'QUESTION'}
      </h3>
      <p className="text-sw-text whitespace-pre-line">{scene.question}</p>
      <div className="flex flex-col gap-2 mt-2">
        {scene.options.map((opt, i) => {
          const status = statusFor(i)
          return (
            <button
              key={i}
              type="button"
              disabled={picked !== null}
              onClick={() => setPicked(i)}
              className="text-left px-4 py-2 rounded transition-colors"
              style={{
                border:
                  status === 'correct'
                    ? '2px solid var(--green)'
                    : status === 'wrong'
                      ? '2px solid var(--red)'
                      : '2px solid var(--line2)',
                background:
                  status === 'correct'
                    ? 'rgba(93,202,151,.12)'
                    : status === 'wrong'
                      ? 'rgba(255,94,122,.12)'
                      : 'transparent',
                opacity: picked !== null && status === null ? 0.5 : 1,
              }}
            >
              <span className="text-sw-pink mr-2">
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {picked !== null && (
        <div className="mt-2 flex flex-col gap-3">
          <p
            className={`font-pixel text-sm ${
              picked === scene.correctIndex ? 'text-sw-green' : 'text-sw-red'
            }`}
          >
            {picked === scene.correctIndex ? 'CORRECT' : 'INCORRECT'}
          </p>
          {scene.explanation && (
            <p className="text-sw-text2 text-sm">{scene.explanation}</p>
          )}
          <button
            type="button"
            className="ss-btn ss-btn-cyan self-start"
            onClick={() => onAdvance(scene.next)}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}
