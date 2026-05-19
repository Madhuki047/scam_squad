// Labelled text input styled for the retro Scam Squad theme.
// Spreads any extra props (value, onChange, name, type, etc.) onto the <input>.

function TextField({ label, id, type = 'text', ...rest }) {
  return (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="block font-pixel text-[0.6rem] tracking-widest uppercase text-muted mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="w-full bg-field text-slate-100 font-retro text-xl px-4 py-2
          rounded border border-transparent outline-none
          placeholder:text-slate-500 focus:border-neon-cyan/60"
        {...rest}
      />
    </div>
  )
}

export default TextField
