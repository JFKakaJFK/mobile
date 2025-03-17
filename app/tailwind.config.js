module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  safelist: [],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "baby-blue": {
          DEFAULT: "#A0E8FF",
        },
        "dark-blue": {
          DEFAULT: "#043697",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
