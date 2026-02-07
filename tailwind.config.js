/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode with class strategy
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: require('tailwindcss/colors').slate,
        neutral: require('tailwindcss/colors').slate,
        zinc: require('tailwindcss/colors').slate,
        stone: require('tailwindcss/colors').slate,
      },
    },
  },
  plugins: [],
};
