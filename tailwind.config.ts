import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        portrait: { raw: '(orientation: portrait)' },
      },
      colors: {
        signage: {
          black: '#0a0a0a',
          orange: '#ff6b35',
        },
      },
    },
  },
  plugins: [],
};

export default config;
