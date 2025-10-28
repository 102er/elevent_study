/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kid-blue': '#4FC3F7',
        'kid-pink': '#F06292',
        'kid-yellow': '#FFD54F',
        'kid-green': '#81C784',
        'kid-purple': '#BA68C8',
        'kid-orange': '#FFB74D',
      },
      fontFamily: {
        'kid': ['Comic Sans MS', 'Marker Felt', 'cursive'],
      },
    },
  },
  plugins: [],
}

