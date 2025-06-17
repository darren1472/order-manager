/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      /* --- カスタムカラー ---------------------------------- */
      colors: {
        primary: "#f7931e", // オレンジ
        accent:  "#16a34a", // 緑
        danger:  "#ef4444", // 赤
      },

      /* --- 影・角丸 -------------------------------------- */
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,.12)", // カード用ふんわり影
      },
      borderRadius: {
        xl2: "1.5rem", // 24px の大きめ角丸
      },

      /* --- フォント -------------------------------------- */
      fontFamily: {
        rounded: ['"M PLUS Rounded 1c"', "sans-serif"],
      },
    },
  },

  plugins: [],
};
