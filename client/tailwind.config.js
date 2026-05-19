/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Loaded from Google Fonts in index.html.
        // Use `font-pixel` for headings/UI and `font-retro` for body text.
        pixel: ['"Press Start 2P"', 'cursive'],
        retro: ['VT323', 'monospace'],
      },
      colors: {
        // Scam Squad retro theme palette (from the UI design).
        ink: '#0f0a1e', // darkest background
        panel: '#150f2b', // form card background
        field: '#3a3942', // input background
        neon: {
          pink: '#ec4899',
          cyan: '#22d3ee',
        },
        accent: '#fbbf24', // yellow subtitle text
        muted: '#9d97c0', // labels / secondary text
      },
    },
  },
  plugins: [],
}
