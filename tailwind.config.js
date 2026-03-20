/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        'lp-bg':    '#F5F0E8',
        'lp-dark':  '#212529',
        'lp-red':   '#E63946',
        'lp-green': '#2D6A4F',
        'lp-gray':  '#ADB5BD',
      },
      fontFamily: {
        fredoka: ['"Fredoka One"', 'cursive'],
      },
    },
  },
  plugins: [],
}
