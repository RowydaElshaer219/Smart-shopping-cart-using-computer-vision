import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0481b2', // Main theme color
        secondary: '#06bcfe', // Accent color
        background: '#001b30', // Background color
        text: '#fefefe', // Text color
      },
    },
  },
  plugins: [require("daisyui")],
};
export default config;
