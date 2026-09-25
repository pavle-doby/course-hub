# Task 0.1: Install checklist for the native app

Companion to [n-task-0.md](n-task-0.md). Every package install the plan needs, grouped by phase, with the directory to run it from.

## Rules

- **Expo / React Native packages**: run `npx expo install <pkg>` from `apps/native/`. It picks the SDK 57-compatible version. Don't use `pnpm add` for these.
- **Pure JS packages** (no native code, not SDK-versioned): `pnpm --filter native add <pkg>` from the repo root.
- **Backend packages**: `pnpm --filter api add <pkg>` from the repo root.
- **`@repo/ui-native` components**: `pnpm dlx @react-native-reusables/cli@latest add <name>` from `packages/ui-native/` (see its `AGENTS.md`).
- The repo uses `node-linker=hoisted` (`.npmrc`), so installs update the root `pnpm-lock.yaml`.
- After adding anything with native code, rebuild the dev client (`npx expo run:ios` / `npx expo run:android`, or `npx eas-cli@latest build --profile development`). A Metro reload is not enough.
- After each phase's installs, run `npx expo install --check` and `npx expo-doctor` from `apps/native/`.

## Phase 1: Foundation

Already in `apps/native/package.json` (current branch, uncommitted):

- Workspace deps: `@repo/api-client`, `@repo/contract`, `@repo/i18n`, `@repo/shared`, `@repo/ui-native`, `@repo/ui-theme`
- `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`
- `nativewind`, `tailwindcss@^3` (dev), `prettier-plugin-tailwindcss` (dev)
- `@rn-primitives/portal`, `@rn-primitives/slot`, `lucide-react-native`, `react-native-svg`
- `expo-dev-client`

Still to run:

```bash
# apps/native/
npx expo install --check   # confirm everything above is on SDK 57 versions
npx expo-doctor            # duplicate react / react-native copies, config issues
npx eas-cli@latest login
npx eas-cli@latest init             # links the EAS project, writes extra.eas.projectId to app.json
npx eas-cli@latest build:configure  # creates eas.json; then edit to development / preview / production
```

No global install of `eas-cli`; always call it through `npx eas-cli@latest`.

## Phase 2: Auth, session, navigation

```bash
# apps/native/
npx expo install expo-secure-store @react-native-community/netinfo
```

- `expo-secure-store`: token storage (native counterpart of `apps/web/utils/token-storage.ts`).
- `@react-native-community/netinfo`: network status toast.
- Fallback only if `i18next-react-native-language-detector` breaks on RN 0.86: `npx expo install expo-localization` in `apps/native/`, then drop the old detector from `packages/i18n/package.json` with `pnpm --filter @repo/i18n remove i18next-react-native-language-detector react-native-locale-detector`.

## Phase 3: Learner read path

```bash
# apps/native/
npx expo install expo-video
```

- `expo-video`: HLS playback of the Cloudflare Stream `playbackUrl`. Add its config plugin to `app.json` (background playback / PiP settings as needed).
- `expo-web-browser`: documents in an in-app browser. **Already installed.**
- Confetti: nothing to install if built with `react-native-reanimated` (already installed). Only if the phase spec picks a library: `pnpm --filter native add <library>` (or `npx expo install` if it has native code).

## Phase 4: Quizzes, reviews, profile, settings

No new packages. Missing UI pieces (e.g. `radio-group`, `textarea`) come from the reusables CLI:

```bash
# packages/ui-native/
pnpm dlx @react-native-reusables/cli@latest add radio-group textarea
```

Check `packages/ui-native/src/components/` first; add only what the screens actually need.

## Phase 5: Creator path (editor + uploads)

```bash
# apps/native/
npx expo install expo-image-picker expo-document-picker
```

- `expo-image-picker`: thumbnail and video selection. Add its config plugin to `app.json` with the photo-library / camera permission strings.
- `expo-document-picker`: lesson documents and video files.
- Uploads use `fetch` / `XMLHttpRequest` with the picked file URI, so no upload library.
- Only if Phase 5 decides on resumable (tus) uploads for long videos: `pnpm --filter native add tus-js-client`.

## Phase 6: Native push notifications

```bash
# apps/native/
npx expo install expo-notifications
```

- `expo-notifications`: permission, Expo push token, tap handling. Add its config plugin to `app.json`. `expo-device` (needed to skip simulators) and `expo-constants` (for `projectId`) are **already installed**.
- Push credentials (APNs key, FCM `google-services.json`) are set up through `npx eas-cli@latest credentials` from `apps/native/`, not installed.

Backend:

```bash
# repo root (optional)
pnpm --filter api add expo-server-sdk
```

Optional: the Expo Push API is a single `POST https://exp.host/--/api/v2/push/send`, so plain `fetch` works without a dependency. Add `expo-server-sdk` only if its batching and receipt helpers are needed. If an Expo access token is used, add it to `apps/api/.env.example`.

## Phase 7: Parity polish and release

```bash
# apps/native/
npx expo install expo-clipboard
```

- `expo-clipboard`: copy a newly created personal access token.
- Universal links / app links: config only (`app.json` `ios.associatedDomains`, `android.intentFilters`, plus files in `apps/web/public`). No packages.
- Release: `npx eas-cli@latest build --profile production`, `npx eas-cli@latest submit`, and `npx expo install expo-updates` in `apps/native/` only if OTA updates via `eas update` are adopted.

## Summary

| Phase | Where            | Command                                                                  |
| ----- | ---------------- | ------------------------------------------------------------------------ |
| 1     | `apps/native/`   | `npx expo install --check`, `npx expo-doctor`, `npx eas-cli@latest init` / `build:configure` |
| 2     | `apps/native/`   | `npx expo install expo-secure-store @react-native-community/netinfo`     |
| 3     | `apps/native/`   | `npx expo install expo-video`                                            |
| 4     | `packages/ui-native/` | `pnpm dlx @react-native-reusables/cli@latest add <components>` (as needed) |
| 5     | `apps/native/`   | `npx expo install expo-image-picker expo-document-picker`                |
| 6     | `apps/native/`   | `npx expo install expo-notifications`                                    |
| 6     | repo root        | `pnpm --filter api add expo-server-sdk` (optional; `fetch` is enough)    |
| 7     | `apps/native/`   | `npx expo install expo-clipboard` (+ `expo-updates` if OTA)              |
