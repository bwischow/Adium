import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        ink: '#000000',
        peach: {
          DEFAULT: '#F6D6B4',
          dark: '#E8C49E',
        },
        terminal: {
          DEFAULT: '#E5EFDA',
          dark: '#D4E0C8',
        },
        accent: {
          DEFAULT: '#F6D6B4',
          hover: '#E8C49E',
          light: '#FBF0E4',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        blink: 'blink 1s infinite',
      },
      keyframes: {
        blink: {
          '50%': { opacity: '0.2' },
        },
      },
    },
  },
  plugins: [],
}

export default config
