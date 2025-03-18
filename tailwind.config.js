/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F59E0B', // оранжевый
          light: '#FBBF24',
          dark: '#D97706',
        },
        secondary: {
          DEFAULT: '#22C55E', // зеленый
          light: '#4ADE80',
          dark: '#16A34A',
        },
        accent: {
          DEFAULT: '#FEF3C7', // желтый
          light: '#FEF9C3',
          dark: '#FDE68A',
        },
        warm: '#92400E', // коричневый
        beige: {
          DEFAULT: '#F5F5DC', // бежевый
          light: '#FAFAF0',
          dark: '#E8E8D0',
        },
        brown: {
          DEFAULT: '#8B4513', // коричневый
          light: '#A0522D',
          dark: '#654321',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
} 