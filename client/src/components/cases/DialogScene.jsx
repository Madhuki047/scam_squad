// A single line of dialog with a speaker portrait + name. Click anywhere
// inside the panel to advance.
export default function DialogScene({ scene, onAdvance }) {
  const colour = scene.speakerColor || 'cyan'
  return (
    <button
      type="button"
      onClick={() => onAdvance(scene.next)}
      className="w-full ss-card p-6 text-left flex gap-5 items-start cursor-pointer hover:border-sw-cyan"
    >
      <div
        className="shrink-0 rounded"
        style={{
          width: 56,
          height: 56,
          background: `var(--${colour})`,
          boxShadow: `0 0 12px var(--${colour})`,
        }}
      />
      <div className="flex-1 min-w-0">
        <div className={`font-pixel text-sm text-sw-${colour} mb-2`}>
          {scene.speaker}
        </div>
        <p className="text-sw-text leading-relaxed whitespace-pre-line">
          {scene.text}
        </p>
        <div className="text-sw-text3 text-xs mt-3 ss-blink">▶ continue</div>
      </div>
    </button>
  )
}
