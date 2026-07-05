/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#4D50A2',
          purpledark: '#3B3E85',
          orange: '#FCBC65',
          orangedeep: '#F5A93D',
          ink: '#26284F',
          paper: '#FFFFFF',
          mist: '#F4F4FB',
        },
      },
      fontFamily: {
        display: ['Archivo Black', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
