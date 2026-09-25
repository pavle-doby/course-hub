# @repo/ui-theme

Shared design tokens (colors, radius) for the web app and the native app.

## Structure

```
packages/ui-theme/
├── src/
│   ├── native/
│   │   ├── tokens.ts          # THEME (light/dark), ThemeColors, ColorScheme. No imports.
│   │   ├── theme.ts           # NAV_THEME (React Navigation) built from THEME
│   │   ├── tailwindPreset.ts  # nativeTailwindPreset (Tailwind v3 / NativeWind) built from THEME
│   │   └── index.ts           # Barrel: THEME, NAV_THEME, types
│   ├── web/
│   │   └── index.css          # Tailwind v4: @theme inline, :root and .dark CSS variables
│   └── index.ts               # Re-exports ./native
└── package.json
```

## Entry points

| Import path                                       | Contents                                           | Used by                                   |
| ------------------------------------------------- | -------------------------------------------------- | ----------------------------------------- |
| `@repo/ui-theme` / `@repo/ui-theme/native`        | `THEME`, `NAV_THEME`, `ThemeColors`, `ColorScheme` | Native app code (style props, navigation) |
| `@repo/ui-theme/tailwind`                         | `nativeTailwindPreset`                             | `apps/native/tailwind.config.js`          |
| `@repo/ui-theme/web` / `@repo/ui-theme/index.css` | Tailwind v4 CSS variables                          | Web `globals.css`                         |

## Native: Tailwind preset

`apps/native` runs NativeWind v4, which needs Tailwind 3, while web uses Tailwind 4. The two can't share one config, so native gets its tokens from a preset generated from `THEME`:

```js
// apps/native/tailwind.config.js
const { nativeTailwindPreset } = require("@repo/ui-theme/tailwind");

module.exports = {
  presets: [require("nativewind/preset"), nativeTailwindPreset],
  // ...
};
```

The preset:

- adds one color per token, named like the web CSS variables (`bg-primary`, `text-card-foreground`, `bg-chart-1`, …), as `hsl(var(--name) / <alpha-value>)` so opacity modifiers (`bg-primary/90`) work;
- emits `:root` (light) and `.dark:root` (dark) CSS variables plus `--radius` through `addBase`, so `apps/native/src/global.css` only holds the Tailwind directives and font variables;
- sets `darkMode: "class"` and safelists `dark` (otherwise Tailwind prunes the `.dark:root` block);
- sets `rounded-sm/md/lg` from `--radius`.

`tokens.ts` has no imports on purpose: Tailwind loads the config in Node (through jiti), and `theme.ts` imports `@react-navigation/native`, which can't load there. Keep `tailwindPreset.ts` out of the `native` barrel for the same reason.

## ⚠️ Keep web and native in sync

Token values exist in two places:

1. `THEME.light.*` / `THEME.dark.*` in `src/native/tokens.ts` (native: style props, navigation theme, and the Tailwind preset)
2. The matching CSS variable in `src/web/index.css` (web)

Change both together. Native CSS variables come from the preset, so nothing in `apps/native` needs editing.
