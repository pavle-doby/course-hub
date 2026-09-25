const { hairlineWidth } = require("nativewind/theme");
const { nativeTailwindPreset } = require("@repo/ui-theme/tailwind");

// Colors and radius come from @repo/ui-theme (THEME), shared with web; the preset also emits
// the :root / .dark:root CSS variables, so src/global.css doesn't redefine them.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui-native/src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset"), nativeTailwindPreset],
  theme: {
    extend: {
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
