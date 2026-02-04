/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3a3a3a',
        'primary-dark': '#232323',
        accent: '#b28a45',
        soft: '#f3f1ee',
        text: '#2b2b2b',
        muted: '#6b6b6b',
        white: '#ffffff',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        custom: '0 24px 60px rgba(23, 55, 95, 0.12)',
        card: '0 20px 40px rgba(15, 38, 66, 0.08)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #f3f1ee 0%, #ffffff 55%, #fbf2df 100%)',
      }
    },
  },
  plugins: [],
}
