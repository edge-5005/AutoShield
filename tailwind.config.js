/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bespoke Automotive Studio: Obsidian Carbon & Ceramic Gold
        carbon: {
          950: '#07080B', // Studio darkroom floor
          900: '#0E1017', // Carbon fiber bays
          850: '#151822', // Card panel
          800: '#1F2432', // Titanium borders
          700: '#2D3446', // Active border
          600: '#424C63'
        },
        ceramic: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // Liquid Ceramic Gold
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F'
        },
        hydro: {
          400: '#22D3EE',
          500: '#06B6D4', // Hydrophobic water-bead cyan
          600: '#0891B2'
        },
        racing: {
          500: '#F43F5E', // Caliper red
          600: '#E11D48'
        },
        // Brand primary maps to Ceramic Gold
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Override standard slate to rich obsidian carbon tones
        slate: {
          950: '#07080B',
          900: '#0E1017',
          850: '#151822',
          800: '#1F2432',
          700: '#2D3446',
          600: '#4B556D',
          500: '#6C7793',
          400: '#98A2B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9'
        },
        // Override standard blue to ceramic gold highlights so existing components inherit luxury automotive warmth
        blue: {
          500: '#F59E0B',
          600: '#D97706',
          400: '#FBBF24',
          300: '#FCD34D',
          200: '#FDE68A',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451A03'
        }
      },
      boxShadow: {
        'ceramic': '0 8px 30px -4px rgba(245, 158, 11, 0.25)',
        'carbon': '0 10px 40px -10px rgba(0, 0, 0, 0.8)',
        'gloss': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)'
      }
    },
  },
  plugins: [],
}
