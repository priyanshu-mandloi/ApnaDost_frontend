import type { Config } from "tailwindcss";

// In Tailwind V4, most theme customization moves to globals.css @theme block.
// This file only needs content paths.
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
