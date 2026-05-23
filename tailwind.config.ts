import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        foreground: '#f5f5f5',
        card: '#1a1a1a',
        'card-foreground': '#f5f5f5',
        primary: '#ff9500', // Saffron/Orange
        'primary-foreground': '#0f0f0f',
        secondary: '#138808', // Green
        'secondary-foreground': '#f5f5f5',
        accent: '#ff6b35', // Bright Orange
        'accent-foreground': '#0f0f0f',
        muted: '#404040',
        'muted-foreground': '#a0a0a0',
        border: '#333333',
        input: '#1a1a1a',
        ring: '#ff9500',
        destructive: '#ef4444',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
