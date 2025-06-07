import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // or 'class' if you want manual toggling
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
        colors: {
            background: 'var(--background)',
            foreground: 'var(--text-primary)',
            muted: 'var(--text-secondary)',
            accent: 'var(--accent)',
            'accent-foreground': 'var(--accent-foreground)',
            input: 'var(--input)',
        },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
