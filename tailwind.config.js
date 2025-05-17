/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        idecide: {
          primary: '#abd3d2',        // Light mint green
          secondary: '#a0b4ae',      // Sage green
          accent: '#172241',         // Dark navy (for contrast)
          light: '#f9f9f9',          // Off-white
          dark: '#2D3B38',           // Dark green-gray
          'primary-hover': '#9bc3c2', // Slightly darker mint green
          'accent-hover': '#0e1a38',  // Darker navy
          'secondary-hover': '#91a59f', // Darker sage green
          'success': '#4ade80',       // Success green
          'warning': '#facc15',       // Warning yellow
          'error': '#f87171',         // Error red
          'info': '#60a5fa',          // Info blue
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};