---
applyTo: "packages/ui-theme/**"
---

# ui-theme package

See [`packages/ui-theme/README.md`](./README.md) for the full package overview, structure, and entry points.

## Key rules

- **`src/theme.ts` is the single source of truth.** All token values (colours, radius) are defined there. Never hardcode design tokens elsewhere.
- **Always keep native and web in sync.** Whenever a token value changes, update it in all three places:
  1. `THEME.light.*` / `THEME.dark.*` (React Native)
  2. `THEME_WEB.root.*` / `THEME_WEB.dark.*` (CSS variables, TypeScript)
  3. The corresponding CSS variable in `src/web/index.css`
- **Use the correct entry point** for the target platform — `@repo/ui-theme/native` for React Native, `@repo/ui-theme/web` for Next.js, `@repo/ui-theme/index.css` for Tailwind CSS.
- **Do not add new tokens** to only one platform. Every token must exist in both `THEME` and `THEME_WEB`.
