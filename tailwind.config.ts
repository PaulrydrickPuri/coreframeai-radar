import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for velocity indicators
        velocity: {
          up: '#10b981',    // green
          down: '#ef4444',  // red
          neutral: '#6b7280', // gray
        },
      },
    },
  },
  plugins: [],
};

export default config;
