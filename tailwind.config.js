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
          DEFAULT: '#4F46E5',
          light: '#4338CA',
          dark: '#3730A3',
        },
        secondary: {
          DEFAULT: '#10B981',
          light: '#059669',
          dark: '#047857',
        },
        accent: {
          DEFAULT: '#F3F4F6',
          light: '#F9FAFB',
          dark: '#E5E7EB',
        },
        warm: '#FEF3C7',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
} 