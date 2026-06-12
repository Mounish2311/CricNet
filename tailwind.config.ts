import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: { DEFAULT: '#1f7a4d', dark: '#0e3d27', light: '#2fae6f' },
        leather: { DEFAULT: '#8b1a1a', light: '#c0392b' },
        stadium: { DEFAULT: '#f5d77a', glow: '#fff3c4' },
        night: { DEFAULT: '#0a0f0c', card: '#111813', edge: '#1d2a21' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
      },
      boxShadow: {
        floodlight: '0 0 40px rgba(245, 215, 122, 0.15)',
      },
    },
  },
  plugins: [],
};
export default config;
