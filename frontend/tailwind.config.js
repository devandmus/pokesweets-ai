/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pokemon Gen 1 Color Palette
        'poke-red': '#EE1515',
        'poke-blue': '#3B4CCA',
        'poke-yellow': '#FFDE00',
        'poke-green': '#00A650',
        'poke-orange': '#FF6B00',
        'poke-pink': '#FF69B4',
        'poke-purple': '#8B00FF',
        'poke-brown': '#8B4513',

        // UI Colors
        'pokedex-red': '#DC0A2D',
        'pokedex-dark': '#1D1D1D',
        'pokedex-light': '#F5F5F5',
        'pokedex-screen': '#98D8C8',
        'pokedex-border': '#3A3A3A',

        // Pastels for desserts
        'dessert-cream': '#FFF8DC',
        'dessert-strawberry': '#FFB7CE',
        'dessert-chocolate': '#7B3F00',
        'dessert-vanilla': '#F3E5AB',
        'dessert-mint': '#98FF98',

        // Keep compatibility
        primary: '#EE1515',
        secondary: '#FFDE00',
        accent: '#3B4CCA',
      },
      fontFamily: {
        'pokemon': ['"Press Start 2P"', 'cursive'],
        'pixel': ['"VT323"', 'monospace'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      boxShadow: {
        'retro': '4px 4px 0px 0px rgba(0, 0, 0, 0.25)',
        'retro-lg': '8px 8px 0px 0px rgba(0, 0, 0, 0.25)',
        'pokeball': '0 0 20px rgba(238, 21, 21, 0.5)',
      },
    },
  },
  plugins: [],
}
