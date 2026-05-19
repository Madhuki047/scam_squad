import PixelButton from '../ui/PixelButton'

// Shared layout for the authentication screens (Login and Register).
// Renders the gradient background, the neon game title, a subtitle,
// the form card, and a "Back to Title" button.

function AuthScreen({ title, subtitle, children }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10
        bg-gradient-to-b from-[#190a33] via-[#241047] to-[#3d1466]"
    >
      <h1
        className="font-pixel text-3xl sm:text-4xl text-center
          bg-gradient-to-r from-[#ff5fb8] via-[#f0abfc] to-[#22d3ee]
          bg-clip-text text-transparent
          drop-shadow-[0_0_18px_rgba(236,72,153,0.45)]"
      >
        {title}
      </h1>

      <p className="font-pixel text-[0.6rem] sm:text-xs tracking-[0.3em] text-accent mt-4 mb-8">
        --- {subtitle} ---
      </p>

      <div className="w-full max-w-md rounded-lg border border-[#4b4470] bg-panel/80 p-7 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        {children}
      </div>

      <PixelButton to="/" variant="outline" icon="◀" className="mt-7">
        Back to Title
      </PixelButton>
    </div>
  )
}

export default AuthScreen
