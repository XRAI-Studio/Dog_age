/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
        body: ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        ink: '#26332d',
        cream: '#fffaf0',
        coral: '#ef6a5b',
        teal: '#26776d',
        sun: '#f6c85f',
      },
      boxShadow: {
        lift: '0 20px 55px -28px rgba(38, 51, 45, 0.45)',
      },
    },
  },
  plugins: [],
}
