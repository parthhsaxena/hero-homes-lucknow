/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#c81429',
          'red-deep': '#a50e20',
          ink: '#141414',
          'ink-soft': '#333333',
          'ink-muted': '#555555',
          cream: '#F7F6F3',
          'cream-dark': '#EFECE6',
          gold: '#c81429',
          border: '#E8E5DD',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Work Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
