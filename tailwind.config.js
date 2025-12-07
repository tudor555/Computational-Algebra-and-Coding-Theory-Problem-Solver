/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#020617",        // fundal principal foarte închis
          surface: "#0f172a",   // carduri / panouri
          surfaceAlt: "#111827",
          primary: "#38bdf8",   // accent (albastru deschis)
          secondary: "#22c55e", // accent secundar (verde)
          accent: "#eab308",    // accent pentru dificil / highlight
          text: "#e5e7eb",      // text principal deschis
          muted: "#9ca3af",     // text secundar / descrieri
          border: "#1f2937",    // borduri discrete
        },
      },
    },
  },
  plugins: [],
};
