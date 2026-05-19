import { Link } from 'react-router-dom'

// Retro-styled button used across the game.
// - variant="primary": full-width neon action button (e.g. Sign In)
// - variant="outline": smaller bordered button (e.g. Back to Title)
// Pass a `to` prop to render it as a router link instead of a <button>.

const VARIANTS = {
  primary:
    'w-full bg-[#241a3d] border-2 border-neon-pink/70 text-white ' +
    'shadow-[0_0_18px_rgba(236,72,153,0.35)] ' +
    'hover:bg-[#2e2150] hover:shadow-[0_0_26px_rgba(236,72,153,0.55)]',
  outline:
    'bg-transparent border border-slate-500/70 text-slate-200 ' +
    'hover:border-slate-300 hover:text-white',
}

function PixelButton({
  children,
  icon,
  variant = 'primary',
  type = 'button',
  to,
  className = '',
  ...rest
}) {
  const classes =
    'inline-flex items-center justify-center font-pixel text-xs ' +
    'tracking-widest uppercase px-5 py-3 rounded transition-all duration-150 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed ' +
    `${VARIANTS[variant]} ${className}`

  const content = (
    <>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  )
}

export default PixelButton
