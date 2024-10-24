/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      margin: {
       '30': '30px',
      },
    },
    /*container: {
      padding:'2rem',
      center: true,
    },*/
  },
  plugins: [],
  
}