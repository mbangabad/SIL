import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9',
        background: '#0f172a',
        card: '#1e293b',
      },
      borderRadius: {
        lg: '24px',
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0, 0, 0, 0.2)',
      },
      fontFamily: {
        title: ['var(--font-geometric)', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      transitionDuration: {
        fast: '180ms',
      },
    },
  },
  plugins: [],
}

export default config
