/** @type {import('tailwindcss').Config} */
export default {
  // CRITICAL: This content array tells Tailwind WHICH files to scan for class names.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
        }
    },
  },
  plugins: [],
}