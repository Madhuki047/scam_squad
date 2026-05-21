// Scene-setter / stage direction. No speaker - just italic narration the
// player clicks through.
export default function NarrationScene({ scene, onAdvance }) {
  return (
    <button
      type="button"
      onClick={() => onAdvance(scene.next)}
      className="w-full ss-card p-6 text-left cursor-pointer hover:border-sw-cyan"
    >
      <p
        className="text-sw-text2 leading-relaxed whitespace-pre-line"
        style={{ fontStyle: 'italic' }}
      >
        {scene.text}
      </p>
      <div className="text-sw-text3 text-xs mt-3 ss-blink">▶ continue</div>
    </button>
  )
}
