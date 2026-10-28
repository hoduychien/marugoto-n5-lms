import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans JP"', 'sans-serif'],
        jp: ['"Noto Sans"', '"Noto Sans JP"', 'sans-serif'],
        vn: ['"Noto Sans"', '"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
