# n-task-0: Phase 0, Foundation (workspace wiring, app shell, auth)

Detailed plan for Phase 0 of [n-task-init.md](n-task-init.md): index tasks **0 (Workspace wiring)**, **1 (App shell & providers)** and **2 (Auth)**. The progress log at the bottom records what is done.

## Findings that shape the plan

- **pnpm 11 ignores `node-linker=hoisted` in `.npmrc`** (pnpm settings moved to `pnpm-workspace.yaml`). The workspace is installed **isolated** (symlinks under `node_modules/.pnpm`). Expo supports isolated installs since SDK 54, but each workspace package resolves its own `react`, `react-native`, `nativewind`, … from its own folder, so Metro must pin those singletons to the app's copy.
- `@repo/ui-native` is built on **NativeWind v4 + Tailwind 3** (`react-native-css-interop`, `cva`, `@rn-primitives/*`). The web uses Tailwind 4. Native stays on Tailwind 3; the only link between them is the token values in `@repo/ui-theme`.
- `@repo/ui-theme/native` exports `THEME` / `NAV_THEME`, but `theme.ts` imports `@react-navigation/native`, so `tailwind.config.js` (Node) can't load it. The token data moves to a plain `tokens.ts`, plus a Tailwind preset that turns it into CSS variables.
- `@repo/i18n` already has a `react-native` export condition (`src/native.ts`), but it uses `i18next-react-native-language-detector` / `react-native-locale-detector` (unmaintained, old-arch). Replace them with `expo-localization`.
- `@repo/api-client` is platform-agnostic except `env.ts`, which reads only `NEXT_PUBLIC_*`. `configureTokenProviders()` already takes platform token storage and refresh logic.
- `@repo/shared` (`useErrorHandlingForm`, `useZodLocale`) and `@repo/contract` have no DOM / Next imports and can be reused as they are.
- Expo Router in SDK 57 has `Stack.Protected guard={…}`. `redirectTo` is SDK 58+, so a rejected route falls back to the first available screen.
- Web keeps tokens in `localStorage` (`apps/web/utils/token-storage.ts`); refresh goes through `POST /v1/auth/refresh`; login returns `preferences` (`language`, `theme`), and `GET` user preferences exists (`useGetUserPreferences`).

## Decisions

- **Signed-out users see only the auth stack** (login / signup). The public catalog and public course pages for visitors are left to n-task-3 / n-task-8. This keeps one guard and no "public route" list like web's `isPublicRoute`.
- **Theme / language before login** come from the device (`expo-localization`, `useColorScheme`). After login, the server preferences are applied. On a cold start with a session, `useGetUserPreferences` is fetched and applied. Nothing is persisted locally except tokens.
- **Tokens live in `expo-secure-store`**, with an in-memory copy so the Axios interceptor doesn't hit the keychain on every request.
- **Tabs** follow the index: Home, Learn, Courses, Notifications, Profile. Each is a placeholder screen in this phase and gets a real screen in its own task.
- **Lint**: `expo lint` (flat config from `eslint-config-expo`). If it conflicts with the repo's ESLint 10, fall back to `@repo/eslint-config/react-internal`.

## Task 0: Workspace wiring

1. **Clean the template.** Remove `src/app/explore.tsx`, the template `components/`, `hooks/`, `constants/`, `scripts/reset-project.js` (+ its script), and unused template images (react/expo logos, tutorial, tab icons, badges).
2. **Dependencies** (`apps/native/package.json`):
   - Workspace: `@repo/api-client`, `@repo/contract`, `@repo/i18n`, `@repo/shared`, `@repo/ui-native`, `@repo/ui-theme`.
   - JS: `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react-native`, `@rn-primitives/portal`, `@rn-primitives/slot`, `nativewind`, `tailwindcss@^3` (dev).
   - Expo (`npx expo install`): `expo-secure-store`, `expo-localization`, `react-native-svg`.
3. **Config files**: `metro.config.js` (singletons + `withNativeWind`), `babel.config.js` (`jsxImportSource: "nativewind"`, `nativewind/babel`), `tailwind.config.js` (content includes `packages/ui-native/src`, presets `nativewind/preset` + ui-theme preset), `src/global.css` (`@tailwind` directives), `nativewind-env.d.ts`.
4. **`@repo/ui-theme`**: move token data to `src/native/tokens.ts` (no imports), `theme.ts` re-exports it and builds `NAV_THEME`; add `src/native/tailwindPreset.ts` exported as `@repo/ui-theme/tailwind` (CSS variables for `:root` / `.dark:root`, colors as `hsl(var(--x) / <alpha-value>)`, radius).
5. **`@repo/i18n`**: `native.ts` picks the device language with `expo-localization` (optional peer dep); drop the two old detector deps.
6. **`@repo/api-client`**: `env.ts` falls back to `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_VAPID_PUBLIC_KEY` (static `process.env.X` access so Expo inlines them).
7. **Env**: `apps/native/.env.example` with `EXPO_PUBLIC_API_URL` (+ note: Android emulator uses `10.0.2.2`, a device needs the machine's LAN IP).
8. **App config**: `app.json` name `Course Hub`, slug `course-hub`, scheme `coursehub`, iOS `bundleIdentifier` / Android `package` `com.coursehub.app`, plugins `expo-secure-store`, `expo-localization`.
9. **Scripts / turbo**: `typecheck` (`tsc --noEmit`) and `lint` (`expo lint`) in `apps/native/package.json`, so `pnpm typecheck` / `pnpm lint` via turbo include the app.
10. **Docs**: root `CLAUDE.md` (drop "there is no native app"), `ARCHITECTURE.md` (native app entry), `packages/ui-native/AGENTS.md`, `packages/ui-theme/README.md` / `AGENTS.md` (tokens file + tailwind preset), `FEATURES.md` if it mentions native.

## Task 1: App shell & providers

- `src/app/_layout.tsx` (root): `global.css` import, `GestureHandlerRootView` → `ApiClientProvider` → `AuthProvider` → `ThemeProvider` (`NAV_THEME[colorScheme]`) → `Stack` with the auth guard → `PortalHost` + `Toaster`. Splash screen stays up until the session is loaded.
- `src/providers/`: `auth-provider.tsx` (session context), `preferences-sync.tsx` (apply server language / theme when signed in).
- `src/app/(app)/(tabs)/_layout.tsx`: `Tabs` with lucide icons and `t("nav.*")` labels: `index` (Home), `learn`, `courses`, `notifications`, `profile`. Placeholder screens.
- Profile placeholder gets a **Log out** button so the auth loop can be tested end to end.
- `SafeAreaProvider` is provided by Expo Router; screens use `SafeAreaView` / header insets.

## Task 2: Auth

- `src/utils/token-storage.ts`: `saveAuthTokens`, `getAccessToken`, `getRefreshToken`, `clearAuthTokens`, `loadAuthTokens` on SecureStore with an in-memory cache (native version of the web file).
- `AuthProvider`: loads tokens on start, exposes `{ isLoading, isSignedIn, signIn(tokens), signOut() }`, calls `configureTokenProviders` (refresh via `POST /v1/auth/refresh`, `onUnauthorized` → clear tokens + signed out), clears the React Query cache on sign-out.
- Route groups: `(auth)/login`, `(auth)/signup` under `Stack.Protected guard={!isSignedIn}`; `(app)` under `Stack.Protected guard={isSignedIn}`.
- Login screen: `AuthLoginQuerySchema`, `useAuthLogin`, `useErrorHandlingForm`, `useZodLocale`, show/hide password, apply `preferences` (language + theme) on success, then `router.replace(next ?? "/")` for a `next` param (only same-app paths starting with `/`).
- Signup screen: `AuthSignUpQuerySchema` + `confirmPassword` refine, language and theme pickers defaulted from the device and applied live, `useAuthSignUp`.
- Invite token handling (`?token=`) is left to n-task-8.
- Log out: `useAuthSignOut` (best effort), then `signOut()`.
- `ui-native` gaps found while building the screens are added to `@repo/ui-native`, not the app.

## Verification

- `apps/native`: `npx tsc --noEmit`, `npx expo lint`, `npx expo-doctor`, and a Metro bundle check (`npx expo export --platform ios` to a temp dir) since there's no simulator run in this session.
- `pnpm typecheck` for the changed shared packages; `pnpm --filter web build` is not needed unless web-facing files change (`@repo/i18n`, `@repo/api-client` env, `@repo/ui-theme`), in which case run `pnpm typecheck` for web.
- Manual (user): `pnpm ios` / `pnpm android` on a dev build, log in, see tabs, switch language / theme via signup, log out.

## Progress log

### Task 0: Workspace wiring (done)

- [x] Template removed (`explore`, template components/hooks/constants, `scripts/reset-project.js`, unused images). Kept app icons + splash.
- [x] Deps added: `@repo/{api-client,contract,i18n,shared,ui-native,ui-theme}`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react-native`, `@rn-primitives/{portal,slot}`, `nativewind@4`; dev `tailwindcss@3`, `eslint`, `@repo/eslint-config`; via `npx expo install`: `expo-secure-store`, `expo-localization`, `react-native-svg` (config plugins added to `app.json`).
- [x] `metro.config.js` (singletons + `withNativeWind`), `babel.config.js`, `tailwind.config.js`, `src/global.css`, `nativewind-env.d.ts`, `eslint.config.mjs` (`@repo/eslint-config/react-internal`, like `ui-native`).
- [x] `@repo/ui-theme`: `src/native/tokens.ts` (plain data), `theme.ts` keeps `NAV_THEME`, new `src/native/tailwindPreset.ts` exported as `@repo/ui-theme/tailwind`. `safelist: ["dark"]` is needed or Tailwind prunes `.dark:root`. README / AGENTS rewritten to match the code (they described a `theme.ts` / `THEME_WEB` that doesn't exist).
- [x] `@repo/i18n`: dropped `i18next-react-native-language-detector` + `react-native-locale-detector`; `native.ts` just inits with the bundled resources. **Deviation:** device language detection lives in the app (`src/utils/device-locale.ts`, `expo-localization`) instead of the package. Adding `expo-localization` to `@repo/i18n` pulled Expo's `@babel/core@7` into that package's peer graph and changed which `next` copy `next-i18next` resolved.
- [x] `@repo/api-client` `env.ts`: `EXPO_PUBLIC_API_URL` fallback (checked: inlined into the bundle).
- [x] `.env.example`, `app.json` (Course Hub / `course-hub` / scheme `coursehub` / `com.coursehub.app`), scripts `typecheck` + `lint`, README.
- [x] Also needed so `@repo/contract` bundles for RN: `@repo/db-schema` used `node:crypto` `randomBytes` for `publicId` / invitation token defaults → `randomHex()` on global Web Crypto (`src/utils.ts`), same output (hex, same length). `@repo/shared` `useErrorHandlingAction` imported the unexported `@repo/shared/consts/allErrorMessages` → relative import like `useErrorHandlingForm`.
- [x] Docs: `CLAUDE.md` gotchas, `ARCHITECTURE.md`, `packages/ui-native/AGENTS.md`.

### Task 1: App shell & providers (done)

- [x] `src/app/_layout.tsx`: `GestureHandlerRootView` → `ApiClientProvider` → `AuthProvider` → `RootNavigator`; splash held until tokens load; i18n set to the device locale.
- [x] `components/navigation/root-navigator.tsx`: `ThemeProvider` (`NAV_THEME` from NativeWind's color scheme), status bar, `Stack.Protected` for `(app)` / `(auth)`, `PortalHost`, `Toaster`.
- [x] `(app)/_layout.tsx` (stack for later detail screens + `PreferencesSync`), `(app)/(tabs)/_layout.tsx` with Home / Learn / Courses / Notifications / Profile (lucide icons, `nav.*` labels; added `nav.home` in en + sr). Placeholder screens (`components/placeholder-screen.tsx`, marked `ponytail:`).
- Not done: separate stacks per tab. Detail routes get added to the `(app)` stack as their tasks land.

### Task 2: Auth (done)

- [x] `utils/token-storage.ts` (SecureStore + in-memory cache), `utils/refresh-tokens.ts` (single in-flight refresh, so concurrent 401s don't reuse a rotated refresh token).
- [x] `providers/auth-provider.tsx`: `status`, `signIn`, `signOut` (clears tokens + query cache, resets language/theme to device), `configureTokenProviders`.
- [x] `providers/preferences-sync.tsx` + `hooks/use-apply-preferences.ts`: server language / theme applied on cold start and after login.
- [x] Login (`next` param, same-app paths only) and signup (confirm password refine, language / theme pickers defaulted from the device and applied live), using `FormInput` / `ChoiceButtons` / `FormRootError` from `components/form/` (Controller-based, since RN has no `register`).
- [x] Profile tab: Log out (`useAuthSignOut`, best effort, then local sign-out).
- Skipped as on web: forgot password and Google login (stubs on web). Invite `?token=` is n-task-8.

### Verification

- [x] `npx tsc --noEmit` and `npx expo lint` (eslint) in `apps/native`: clean.
- [x] `npx expo export` for iOS (4128 modules) and Android (4222 modules) bundles. The source-map scan finds no duplicate `react`, `react-native`, `@react-navigation/native`, `@tanstack/react-query` or `react-native-css-interop` (only `react-is` 16 vs 19 via prop-types, which is harmless).
- [x] Tailwind preset checked with the Tailwind CLI: `bg-primary/90` → `hsl(var(--primary) / 0.9)`, `:root` + `.dark:root` variables emitted.
- [x] `pnpm --filter api build` passes (db-schema change).
- [x] `npx expo-doctor`: 21/21. Switched the repo to `nodeLinker: hoisted` in `pnpm-workspace.yaml` (pnpm 11 ignored `.npmrc`), clean reinstall, and added `overrides` for `react`, `react-dom`, `react-native-safe-area-context`, `react-native-svg`: unpinned peers (`ui-theme`, `api-client`, `sonner-native`, `lucide-react-native`) had resolved newer versions. The Metro singleton list is reduced to `@react-navigation/native` → `expo-router` (without it, expo-router rejects the standalone copy). iOS + Android export scans: one copy of every package except the harmless `react-is`. `pnpm typecheck`, `pnpm lint`, `turbo build --filter=api... --filter=web...` pass.
- [x] `pnpm typecheck` (8 packages incl. `native`, `web`) and `pnpm lint`: clean (warnings only, pre-existing). The two earlier failures are gone: the broken `ui-native` `components/ui/radio-group.tsx` was removed, and web `proxy.ts` type-checks again.
- [x] Manual run on a simulator / emulator (user): `npx expo prebuild --clean` (name / bundle ID changed; also fixes stale `.pnpm` Pod paths after the switch to hoisted installs), then `pnpm ios` / `pnpm android`. Log in, check the tabs, switch language / theme on signup, log out.
