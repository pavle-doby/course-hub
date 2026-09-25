# Course Hub — Native app

iOS and Android client for Course Hub (Expo SDK 57, Expo Router, React Native 0.86). **In progress**: the goal is feature parity with `apps/web` over the same API. The plan and phases are in [spec/n-task-0.md](spec/n-task-0.md), and the install checklist is in [spec/n-task-0.1.md](spec/n-task-0.1.md).

The stock Expo template README is kept in [README.expo.md](README.expo.md).

## Run

```bash
pnpm install              # from the repo root
cd apps/native
npx expo start            # dev server; open in a development build (not Expo Go)
npx expo run:ios          # or run:android — build the dev client after native deps change
```

## Structure

- `src/app/`: Expo Router screens and layouts (routes only)
- `src/components`, `src/hooks`, `src/constants`: app code outside routes
- `src/global.css`: Tailwind directives and font variables

## Styling

NativeWind v4 on Tailwind 3 (web uses Tailwind 4, so the configs are separate).

- Components come from `@repo/ui-native` (react-native-reusables).
- Theme tokens come from `@repo/ui-theme/tailwind` (`nativeTailwindPreset` in `tailwind.config.js`). Change token values in `@repo/ui-theme`, not here.
- `metro.config.js` makes every workspace package share this app's single copy of `react`, `react-native` and `nativewind`.

## Shared packages

`@repo/api-client` (generated React Query hooks), `@repo/contract`, `@repo/shared`, and `@repo/i18n` are the same packages the web app uses. Don't write native-only API calls.

## Conventions

- Install Expo / React Native packages with `npx expo install <pkg>`, not `pnpm add`.
- Check with `npx tsc --noEmit` and `npx expo lint`.
- Agent rules: [AGENTS.md](AGENTS.md).
