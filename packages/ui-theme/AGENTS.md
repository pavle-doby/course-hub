# ui-theme package

See [`packages/ui-theme/README.md`](./README.md) for the full package overview, structure, and entry points.

## Key rules

- **Token values live in two places that must match**: `src/native/tokens.ts` (`THEME.light` / `THEME.dark`) and `src/web/index.css` (`:root` / `.dark`). Change both together. Never hardcode design tokens elsewhere.
- **Keep `src/native/tokens.ts` import-free**: the Tailwind preset loads it in Node.
- **Use the correct entry point** for the target platform: `@repo/ui-theme/native` for React Native, `@repo/ui-theme/tailwind` for the native Tailwind config, `@repo/ui-theme/index.css` for web Tailwind.
- **Do not add new tokens** to only one platform.
