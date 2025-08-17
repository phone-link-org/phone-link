/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          light: "#F5F5F5",
          dark: "#343434",
        },
        foreground: {
          light: "#343434",
          dark: "#F5F5F5",
        },
        primary: {
          light: "#4F7942",
          dark: "#9DC183",
        },
      },
    },
  },
  plugins: [],
};
