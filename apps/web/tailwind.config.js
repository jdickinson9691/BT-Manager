/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        btDark: '#0d1117',
        btCard: '#161b22',
        btBorder: '#30363d',
        btAccent: '#f59e0b',
      },
    },
  },
  plugins: [],
}
