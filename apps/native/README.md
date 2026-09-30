# Course Hub native app

Expo SDK 57 (Expo Router, NativeWind v4) client for the same API as `apps/web`. Plan and progress: [`spec/n-task-init.md`](spec/n-task-init.md).

## Run

1. Start the API (`pnpm api` from the repo root).
2. `cp .env.example .env` and set `EXPO_PUBLIC_API_URL`: `localhost` works on the iOS simulator, the Android emulator needs `http://10.0.2.2:7007/api`, a device needs your machine's LAN IP.
3. `pnpm ios` / `pnpm android` from the repo root (or `npx expo start` here).

After changing `app.json` (name, bundle ID, plugins) or adding a library with native code, regenerate and rebuild the native project: `npx expo prebuild --clean`, then `npx expo run:ios` / `npx expo run:android`.

## Checks

```bash
npx tsc --noEmit   # or pnpm --filter native typecheck
npx expo lint
npx expo-doctor
```

## Layout

- `src/app/`: routes only. `(auth)` (login, signup) and `(app)/(tabs)` are switched by `Stack.Protected` in `src/components/navigation/root-navigator.tsx`.
- `src/providers/`: `AuthProvider` (SecureStore tokens, refresh, sign-out), `PreferencesSync` (server language + theme).
- `src/components/`: app components; reusable UI goes in `@repo/ui-native`.
- `metro.config.js`: NativeWind, plus resolves `@react-navigation/native` from `expo-router`. The repo install is hoisted and `pnpm-workspace.yaml` `overrides` pin native singletons, so there's one copy of each.
