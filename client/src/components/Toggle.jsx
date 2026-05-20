// On/off switch styled for the synthwave UI. Controlled component:
// pass `checked` and an `onChange(nextValue)` handler.
export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between gap-4 py-2 cursor-pointer">
      <span className="text-sw-text2">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-12 h-6 rounded-full transition-colors shrink-0"
        style={{
          background: checked ? 'var(--cyan)' : 'rgba(255,255,255,.15)',
          border: '1.5px solid var(--line2)',
        }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
          style={{
            left: checked ? '26px' : '4px',
            background: checked ? '#1a0033' : 'var(--text3)',
          }}
        />
      </button>
    </label>
  )
}
