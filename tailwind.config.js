/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3b82f6',
          strong: '#2563eb',
          medium: '#93c5fd',
        },
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}