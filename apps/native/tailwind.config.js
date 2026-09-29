const { nativeTailwindPreset } = require("@repo/ui-theme/tailwind");

// Colors and radius come from @repo/ui-theme (same tokens as web); the preset also emits the
// :root / .dark:root CSS variables, so src/global.css doesn't define them.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui-native/src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset"), nativeTailwindPreset],
};
