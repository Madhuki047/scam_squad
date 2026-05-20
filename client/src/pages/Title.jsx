import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Title screen - the game's entry point. A retro synthwave landscape
// (sun, mountains, perspective grid) built entirely in CSS. Clicking
// anywhere ("PRESS START") goes to sign-in, or straight to Home if the
// player is already signed in.
export default function Title() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  function start() {
    navigate(isAuthenticated ? '/home' : '/login')
  }

  return (
    <div
      onClick={start}
      className="relative min-h-screen overflow-hidden cursor-pointer select-none"
      style={{
        background:
          'linear-gradient(180deg,#1a0033 0%,#3d0066 52%,#7a1f8f 72%,#ff4ec9 100%)',
      }}
    >
      {/* Sun, half-sunk below the horizon. */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: '40%',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background:
            'linear-gradient(180deg,#ffd93d 0%,#ff8c42 48%,#ff4ec9 100%)',
        }}
      >
        {/* Scanline gaps across the lower half of the sun. */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: '52%',
            background:
              'repeating-linear-gradient(180deg, transparent 0 9px, #2a0050 9px 15px)',
          }}
        />
      </div>

      {/* Mountain silhouette along the horizon. */}
      <div
        className="absolute inset-x-0"
        style={{
          bottom: '50%',
          height: 150,
          background: '#220043',
          clipPath:
            'polygon(0 100%, 12% 30%, 23% 72%, 37% 12%, 51% 66%, 64% 26%, 79% 78%, 91% 40%, 100% 100%)',
        }}
      />

      {/* Perspective grid floor. */}
      <div
        className="absolute left-1/2 bottom-0"
        style={{
          width: '300%',
          height: '50%',
          transform:
            'translateX(-50%) perspective(320px) rotateX(62deg)',
          transformOrigin: 'bottom center',
          backgroundImage:
            'linear-gradient(rgba(93,213,232,.6) 2px, transparent 2px), linear-gradient(90deg, rgba(255,78,201,.6) 2px, transparent 2px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Decorative pixel sprites. */}
      <span
        className="absolute"
        style={{ top: '20%', left: '15%', width: 16, height: 16, background: 'var(--cyan)', boxShadow: '0 0 12px var(--cyan)' }}
      />
      <span
        className="absolute"
        style={{ top: '30%', right: '17%', width: 12, height: 12, background: 'var(--yellow)', boxShadow: '0 0 12px var(--yellow)' }}
      />
      <span
        className="absolute"
        style={{ top: '14%', right: '32%', width: 10, height: 10, background: 'var(--violet)', boxShadow: '0 0 12px var(--violet)' }}
      />

      {/* Title + start prompt. */}
      <div className="relative z-10 flex flex-col items-center pt-[12vh] gap-5 text-center px-4">
        <h1 className="font-pixel text-sw-cyan text-glow text-3xl md:text-5xl leading-tight">
          SCAM
          <br />
          SQUAD
        </h1>
        <p className="text-sw-text2 text-xl max-w-md">
          Unit Zero needs you, agent.
        </p>
        <p className="font-pixel text-sw-yellow text-sm md:text-base mt-[30vh] ss-blink">
          PRESS START
        </p>
      </div>
    </div>
  )
}
