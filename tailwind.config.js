/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Gilroy-Regular', 'system-ui', 'sans-serif'],
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
      },
    },
  },
  plugins: [],
}