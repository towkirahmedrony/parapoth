/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dyn-bg': 'var(--dyn-bg)',
        'dyn-card': 'var(--dyn-card)',
        'dyn-text': 'var(--dyn-text)',
        'dyn-primary': 'var(--dyn-primary)',
        'dyn-accent': 'var(--dyn-accent)',
      },
      fontFamily: {
        sans: ['Inter', 'Hind Siliguri', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
