// Teaching panel: a title, an optional speaker preface, and a list of
// bullet points. Used after a failure to break down what the player
// missed, and after a success to lock the lesson in.
export default function DebriefScene({ scene, onAdvance }) {
  return (
    <div className="ss-card p-6 flex flex-col gap-4">
      <h3 className="font-pixel text-sw-pink text-sm">
        {scene.title || 'DEBRIEF'}
      </h3>
      {scene.intro && (
        <p className="text-sw-text2 whitespace-pre-line">{scene.intro}</p>
      )}
      <ul className="flex flex-col gap-2">
        {scene.bullets.map((b, i) => (
          <li
            key={i}
            className="flex gap-3 items-start"
            style={{ borderLeft: '2px solid var(--cyan)', paddingLeft: 12 }}
          >
            {typeof b === 'string' ? (
              <span className="text-sw-text2">{b}</span>
            ) : (
              <span>
                <span className="text-sw-cyan">{b.head}</span>
                {b.body && (
                  <span className="text-sw-text2"> — {b.body}</span>
                )}
              </span>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="ss-btn ss-btn-cyan self-start mt-2"
        onClick={() => onAdvance(scene.next)}
      >
        Continue
      </button>
    </div>
  )
}
