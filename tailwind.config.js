/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2D5959',
        secondary: '#B5D3D3',
        accent: '#85B1B1',
      },
    },
  },
  plugins: [],
};