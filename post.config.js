export default {
  plugins: {
    // CRITICAL: Tells PostCSS to run Tailwind first
    tailwindcss: {},
    // CRITICAL: Helps handle vendor prefixes for better browser compatibility
    autoprefixer: {}, 
  },
}