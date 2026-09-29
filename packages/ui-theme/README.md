# @repo/ui-theme

Shared design tokens (colors, radius) for the web and native apps.

## Structure

```
packages/ui-theme/
├── src/
│   ├── native/
│   │   ├── tokens.ts          # THEME (light/dark) — plain data, no imports
│   │   ├── theme.ts           # NAV_THEME for React Navigation / Expo Router
│   │   ├── tailwindPreset.ts  # Tailwind 3 preset for NativeWind (CSS variables from THEME)
│   │   └── index.ts           # Barrel: THEME, NAV_THEME, ThemeColors, ColorScheme
│   ├── web/
│   │   └── index.css          # Tailwind 4 CSS variables (:root, .dark, @theme inline)
│   └── index.ts               # Re-exports ./native
└── package.json
```

## Entry points

| Import path                | Contents                                                           |
| -------------------------- | ------------------------------------------------------------------ |
| `@repo/ui-theme/native`    | `THEME`, `NAV_THEME`, `ThemeColors`, `ColorScheme`                 |
| `@repo/ui-theme/tailwind`  | `nativeTailwindPreset` for `apps/native/tailwind.config.js` (Node) |
| `@repo/ui-theme/index.css` | Web Tailwind 4 CSS variables (same as `@repo/ui-theme/web`)        |

`tailwindPreset.ts` is not in the `native` barrel: Tailwind loads it in Node, where `theme.ts`'s `@react-navigation/native` import can't be required. It turns `THEME` into `--background`, `--card-foreground`, … variables on `:root` / `.dark:root` and maps the color names to `hsl(var(--x) / <alpha-value>)`, so native uses the same class names as web (`bg-primary/90`, `text-muted-foreground`).

## Keep web and native in sync

A token change goes in **both** `src/native/tokens.ts` (`THEME.light` / `THEME.dark`) and `src/web/index.css` (`:root` / `.dark`).
