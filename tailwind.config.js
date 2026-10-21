/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#17392E",
          light: "#1F4A3A",
          dark: "#0E241C",
        },
        sand: "#E8DCC8",
        gold: {
          DEFAULT: "#C9A227",
          light: "#E0BE55",
        },
        cream: "#FAF8F4",
        ink: "#1D2521",
        clay: "#B4623A",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(29,37,33,0.06) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
