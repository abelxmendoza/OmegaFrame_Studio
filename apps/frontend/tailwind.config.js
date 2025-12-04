/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        omega: {
          bg: '#0b0b0f',
          panel: '#111118',
          border: '#1c1c24',
          accent: '#7938ff',
          text: '#e0dfff',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      boxShadow: {
        'omega-glow': '0 0 15px #7938ff80',
        'omega-glow-lg': '0 0 25px #7938ff80',
      },
    },
  },
  plugins: [],
}

