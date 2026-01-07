/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "x-blue": "#1d9bf0",
        "x-black": "#0f1419",
        "x-gray": "#536471",
        "x-light": "#eff3f4",
      },
    },
  },
  plugins: [],
};
