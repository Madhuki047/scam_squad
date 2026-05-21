import { useState } from 'react'

// Multi-select scene used for "flag the harmful messages" / "mark the
// fakes" interactions. Each option declares a `harmful` boolean; the
// player's score is the count of correctly classified items.
export default function MultiScene({ scene, onAdvance }) {
  const [selected, setSelected] = useState(() => new Set())
  const [submitted, setSubmitted] = useState(false)

  function toggle(i) {
    if (submitted) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const total = scene.options.length
  const correctCount = scene.options.reduce((acc, opt, i) => {
    const flagged = selected.has(i)
    const isHarmful = Boolean(opt.harmful)
    return acc + (flagged === isHarmful ? 1 : 0)
  }, 0)

  return (
    <div className="ss-card p-6 flex flex-col gap-4">
      {scene.prompt && (
        <p className="text-sw-text2 whitespace-pre-line">{scene.prompt}</p>
      )}
      <div className="flex flex-col gap-2">
        {scene.options.map((opt, i) => {
          const flagged = selected.has(i)
          const correctMark = submitted && Boolean(opt.harmful)
          const wrongMark = submitted && flagged !== Boolean(opt.harmful)
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className="text-left px-4 py-2 rounded transition-colors"
              style={{
                border: correctMark
                  ? '2px solid var(--green)'
                  : wrongMark
                    ? '2px solid var(--red)'
                    : flagged
                      ? '2px solid var(--pink)'
                      : '2px solid var(--line2)',
                background: flagged
                  ? 'rgba(255,78,201,.10)'
                  : 'transparent',
              }}
            >
              <span className="text-sw-pink mr-2">{flagged ? '⚑' : '·'}</span>
              {opt.label}
            </button>
          )
        })}
      </div>

      {!submitted ? (
        <button
          type="button"
          className="ss-btn ss-btn-pink self-start"
          disabled={selected.size === 0 && !scene.allowEmpty}
          onClick={() => setSubmitted(true)}
        >
          Submit
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="font-pixel text-sm text-sw-yellow">
            {correctCount} / {total} classified correctly
          </p>
          {scene.debrief && (
            <p className="text-sw-text2 text-sm whitespace-pre-line">
              {scene.debrief}
            </p>
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
