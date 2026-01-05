/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter-Regular', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50 : '#FFEBE6',
          100: '#FFCEC2',
          200: '#FFA792',
          300: '#FF7E5D',
          400: '#FF582F',
          500: '#FF3300',
          600: '#D92B00',
          700: '#B52300',
          800: '#911D00',
          900: '#731701', 
        },
        dark: {
          50: '#f7fafc',
          100: '#edf2f7',
          200: '#e2e8f0',
          300: '#cbd5e0',
          400: '#a0aec0',
          500: '#718096',
          600: '#4a5568',
          700: '#2d3748',
          800: '#1a202c',
          900: '#171923',
        },
      },
    },
  },
  plugins: [],
}