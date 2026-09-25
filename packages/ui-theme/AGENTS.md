# ui-theme package

See [`packages/ui-theme/README.md`](./README.md) for the full package overview, structure, and entry points.

## Key rules

- **`src/native/tokens.ts` (`THEME`) is the source of truth for native.** The NativeWind preset (`src/native/tailwindPreset.ts`) and `NAV_THEME` are derived from it. Never hardcode token values in `apps/native` (no color variables in its `global.css`).
- **Always keep native and web in sync.** When a token value changes, update both:
  1. `THEME.light.*` / `THEME.dark.*` in `src/native/tokens.ts`
  2. The corresponding CSS variable in `src/web/index.css`
- **Do not add new tokens to only one platform.** A new key in `THEME` automatically becomes a native Tailwind color (`chartFoo` → `bg-chart-foo`, `--chart-foo`); add the same variable (and `--color-*` in `@theme inline`) to `src/web/index.css`.
- **Keep `tokens.ts` import-free and `tailwindPreset.ts` out of the `native` barrel.** Tailwind loads them in Node, where `@react-navigation/native` can't be required.
- **Use the correct entry point:** `@repo/ui-theme/native` for React Native code, `@repo/ui-theme/tailwind` for the native Tailwind config, `@repo/ui-theme/web` (or `/index.css`) for the Next.js stylesheet.
