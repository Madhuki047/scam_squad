// Transient award banner shown when a 'badge' scene fires. The engine
// auto-dismisses it after a few seconds.
export default function BadgeBanner({ badge }) {
  return (
    <div
      className="fixed top-20 left-1/2 ss-card px-6 py-4 flex items-center gap-4"
      style={{
        transform: 'translateX(-50%)',
        zIndex: 40,
        background: 'rgba(13,0,30,.95)',
        borderColor: 'var(--pink)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          background: 'var(--violet)',
          boxShadow: '0 0 16px var(--violet)',
          borderRadius: 4,
        }}
      />
      <div>
        <div className="font-pixel text-sw-pink text-xs">BADGE EARNED</div>
        <div className="text-sw-cyan">{badge.name}</div>
      </div>
    </div>
  )
}
