/** @type {import('tailwindcss').Config} */

// The synthwave palette is namespaced under `sw` (e.g. text-sw-cyan,
// border-sw-line2) so it adds to - rather than overwrites - Tailwind's
// built-in color scales.
//
// Colors point at the CSS variables defined in src/index.css, so that is
// the single source of truth. This also lets the high-contrast
// accessibility toggle (which overrides those variables) cascade through
// every Tailwind color utility automatically.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sw: {
          cyan: 'var(--cyan)',
          pink: 'var(--pink)',
          'pink-soft': 'var(--pink-soft)',
          yellow: 'var(--yellow)',
          orange: 'var(--orange)',
          green: 'var(--green)',
          red: 'var(--red)',
          violet: 'var(--violet)',
          line: 'var(--line)',
          line2: 'var(--line2)',
          text: 'var(--text)',
          text2: 'var(--text2)',
          text3: 'var(--text3)',
          card: 'rgba(13,0,30,.7)',
        },
      },
      fontFamily: {
        mono: ['VT323', 'monospace'],
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      backgroundImage: {
        'sw-gradient':
          'linear-gradient(180deg,#1a0033 0%,#2a0050 50%,#3d0066 100%)',
      },
    },
  },
  plugins: [],
}
