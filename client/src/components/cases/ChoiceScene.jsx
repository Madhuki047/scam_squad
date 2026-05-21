// Branching choice: each option declares its successor scene id.
export default function ChoiceScene({ scene, onAdvance }) {
  return (
    <div className="ss-card p-6 flex flex-col gap-4">
      {scene.prompt && (
        <p className="text-sw-text2 whitespace-pre-line">{scene.prompt}</p>
      )}
      <div className="flex flex-col gap-3">
        {scene.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onAdvance(opt.next)}
            className="ss-btn ss-btn-cyan text-left"
          >
            <span className="text-sw-pink mr-2">{i + 1}.</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
