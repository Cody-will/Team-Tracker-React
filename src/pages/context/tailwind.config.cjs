/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        // Your custom 1080px breakpoint
        hd: "1080px",
      },
    },
  },
  plugins: [],
};
