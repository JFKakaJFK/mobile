module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'baby-blue': {
          DEFAULT: '#A0E8FF'
        },
        'dark-blue': {
          DEFAULT: '#043697'
        }
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
