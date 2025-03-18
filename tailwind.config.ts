import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B4513', // brown
          light: '#A0522D',
        },
        secondary: {
          DEFAULT: '#FF8C00', // dark orange
          light: '#FFA500',
        },
        accent: {
          DEFAULT: '#F5DEB3', // beige
          light: '#FAEBD7',
        },
        nature: {
          DEFAULT: '#556B2F', // green
          light: '#6B8E23',
        },
        warm: {
          DEFAULT: '#FFD700', // yellow
          light: '#FFEB3B',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
}

export default config 