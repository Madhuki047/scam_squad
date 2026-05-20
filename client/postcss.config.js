// PostCSS pipeline for Tailwind. Autoprefixer adds vendor prefixes so the
// retro CSS (gradients, text-shadows) works across browsers.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
