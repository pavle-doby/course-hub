# @repo/ui-theme

Shared design-token and theme package for the monorepo. It is the **single source of truth** for all colour values, radii, and spacing tokens across every platform.

## Structure

```
packages/ui-theme/
├── src/
│   ├── native/         # React Native / Expo theme
│   │   └── index.ts    # Exports: THEME, NAV_THEME, THEME_NATIVE, ThemeColors, ColorScheme
│   ├── web/            # Web (Next.js / Tailwind CSS) theme
│   │   ├── index.ts    # Exports: THEME_WEB, applyThemeVars, ThemeWeb
│   │   └── index.css   # CSS custom properties for :root and .dark (Tailwind v4)
│   ├── theme.ts        # Source of truth — all token values live here
│   └── index.ts        # Barrel re-export (re-exports everything from native + web)
└── package.json
```

## Entry Points

| Import path                | Contents                                                      |
| -------------------------- | ------------------------------------------------------------- |
| `@repo/ui-theme`           | Everything — native + web TypeScript exports                  |
| `@repo/ui-theme/native`    | Native-only: `THEME`, `NAV_THEME`, `THEME_NATIVE`             |
| `@repo/ui-theme/web`       | Web-only: `THEME_WEB`, `applyThemeVars`                       |
| `@repo/ui-theme/index.css` | Tailwind v4 CSS variables (`@theme inline`, `:root`, `.dark`) |

## How tokens are derived

`src/theme.ts` defines three objects:

- **`THEME`** — camelCase color tokens consumed directly by React Native style props.
- **`THEME_WEB`** — CSS custom properties grouped by scope (`inline`, `root`, `dark`), mirroring `src/web/index.css`.
- **`THEME_NATIVE`** — `THEME_WEB` converted to camelCase keys for NativeWind / programmatic use.

## ⚠️ Important — keep both themes in sync

`THEME` (native) and `THEME_WEB` (web) must always reflect the same design tokens. Whenever you update a colour value you **must** update it in **both** places and in `src/web/index.css`:

1. `THEME.light.*` / `THEME.dark.*` in `src/theme.ts`
2. `THEME_WEB.root.*` / `THEME_WEB.dark.*` in `src/theme.ts`
3. The corresponding CSS variable in `src/web/index.css`

A mismatch between native and web tokens will cause visual inconsistencies across platforms.
