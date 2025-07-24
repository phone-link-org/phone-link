/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#ffffff',
          dark: '#121212'
        },
        foreground: {
          light: '#1f2937',
          dark: '#f9fafb'
        },
        primary: {
          light: '#15482d',
          dark: '#34d399'
        }
      }
    },
  },
  plugins: [],
}
