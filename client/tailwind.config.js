/** @type {import('tailwindcss').Config} */
module.exports = {
  // --- 1. ADD THIS LINE ---
  darkMode: 'class',
  // --- END ---
  
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}