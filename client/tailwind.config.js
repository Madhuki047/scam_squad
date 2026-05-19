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
    },
  },
  plugins: [],
}
