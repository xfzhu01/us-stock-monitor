import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bull: '#22c55e',
        bear: '#ef4444',
        neutral: '#6b7280',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
