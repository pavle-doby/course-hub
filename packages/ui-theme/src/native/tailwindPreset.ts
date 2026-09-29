import { THEME } from "./tokens";

// Kept out of the `native` barrel: tailwind.config.js loads this in Node, where
// @react-navigation/native (imported by theme.ts) can't be required.

type Tokens = Record<keyof (typeof THEME)["light"], string>;
type ColorName = Exclude<keyof Tokens, "radius">;

const COLOR_NAMES = (Object.keys(THEME.light) as (keyof Tokens)[]).filter(
  (key): key is ColorName => key !== "radius"
);

// cardForeground -> card-foreground, chart1 -> chart-1 (same names as the web CSS variables)
const toKebab = (key: string): string => key.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();

// "hsl(0 0% 9%)" -> "0 0% 9%", so Tailwind can add opacity modifiers (bg-primary/90)
const toHslChannels = (value: string): string => value.replace(/^hsl\((.*)\)$/, "$1");

const toCssVars = (tokens: Tokens): Record<string, string> => ({
  "--radius": tokens.radius,
  ...Object.fromEntries(
    COLOR_NAMES.map((name) => [`--${toKebab(name)}`, toHslChannels(tokens[name])])
  ),
});

/** Tailwind v3 preset for NativeWind: THEME colors and radius as CSS variables. */
export const nativeTailwindPreset = {
  darkMode: "class",
  // `.dark` is toggled at runtime and never appears in source, so Tailwind would prune .dark:root
  safelist: ["dark"],
  theme: {
    extend: {
      colors: Object.fromEntries(
        COLOR_NAMES.map((name) => [toKebab(name), `hsl(var(--${toKebab(name)}) / <alpha-value>)`])
      ),
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    ({ addBase }: { addBase: (styles: Record<string, Record<string, string>>) => void }) => {
      addBase({
        ":root": toCssVars(THEME.light),
        ".dark:root": toCssVars(THEME.dark),
      });
    },
  ],
};
