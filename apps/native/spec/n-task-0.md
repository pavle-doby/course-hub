# Task 0: Native App (iOS + Android) with Web Parity

Goal: ship `apps/native` (Expo SDK 57, Expo Router, React Native 0.86) as a second client that has the same features as `apps/web`, on iOS and Android. The API, database, contract, and generated hooks stay shared. The native app is a new UI over the same backend, not a fork of it.

This is the high-level plan. Each phase below becomes its own spec (`apps/native/spec/task-N.md`) before it is implemented.

## Current state

- `apps/native` is the stock Expo template (`src/app/index.tsx`, `explore.tsx`, template tabs and themed components). `app.json` still says `name: "native"` and `scheme: "native"`. NativeWind is not installed yet, and the app has no workspace deps.
- `@repo/ui-native` has about 25 react-native-reusables components (button, input, card, dialog, select, tabs, switch, progress, sonner-native, …) built on NativeWind v4, `cva`, and `@rn-primitives`.
- `@repo/ui-theme/native` exports `THEME` / `NAV_THEME` tokens.
- `@repo/i18n` already has a `react-native` export (`src/native.ts`, `config.native.ts`) with a device language detector.
- `@repo/api-client`: the Orval hooks and `customInstance` are platform-agnostic. `configureTokenProviders()` already accepts a platform's own token storage and refresh logic. Only `src/env.ts` is web-specific, because it reads `NEXT_PUBLIC_*`.
- `@repo/contract` (Zod + types) and `@repo/shared` (`useErrorHandlingForm/Query/Action`, `useZodLocale`, error-message maps) have no DOM or Next dependencies, so they can be reused as they are.
- Backend auth is bearer-token based (`/v1/auth/*` login/refresh; web keeps the tokens in `localStorage`), so native needs no API auth changes.
- Push notifications are **Web Push (VAPID) only**: `push_subscriptions` stores `endpoint/p256dh/auth`. This is the one feature that needs backend work.

## Guiding decisions

- **Reuse everything below the UI.** Use `@repo/contract`, `@repo/api-client`, `@repo/shared`, and `@repo/i18n` unchanged, or with small platform switches. Don't write native-only API calls; use the generated hooks.
- **UI comes from `@repo/ui-native`** with the same token class names as web (`bg-primary`, `text-foreground`). Add missing components through the react-native-reusables CLI (per `packages/ui-native/AGENTS.md`), not by hand.
- **Same screens, native navigation.** Map web routes to Expo Router tabs and stacks (see the table below). Don't copy web layouts one-to-one: the web mobile layout (`MobileBottomNav`, `MobileHeader`) is the reference, not the desktop side nav.
- **Keep deep links identical to web paths** (`/learn/:publicId`, `/invite/:token`, `/notifications`, …). Notification `url`s and share links then open the right screen with no mapping table. Use universal links / app links on the web domain, plus a custom scheme (`coursehub://`) for development.
- **Expo modules first** (`expo-secure-store`, `expo-video`, `expo-notifications`, `expo-image-picker`, `expo-document-picker`, `expo-web-browser`). Install them with `npx expo install`. Add a third-party dependency only where Expo has no equivalent.
- **Development builds, not Expo Go**, from the first phase, because several of these modules need native code. Build with EAS (`development`, `preview`, `production` profiles).
- **Web-only features stay web-only** (see Non-goals). The native app links out to the web for them.

## Web → native screen map

| Web route                            | Native route (Expo Router)                    | Notes                                                                                               |
| ------------------------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `/auth/[mode]`                       | `(auth)/login`, `(auth)/signup`               | Signup picks language and theme, defaulted from the device. Support `?next=` / invite token.        |
| `/` (home, public catalog)           | `(tabs)/index`                                | Search + paginated public courses.                                                                  |
| `/learn`, `/learn/explore`           | `(tabs)/learn` (segmented Enrolled / Explore) | Enrolled cards show a progress bar.                                                                 |
| `/learn/[publicId]`                  | `learn/[publicId]` stack                      | Reader: topic/lesson tree, video, documents, quiz, progress, review. `?topic=` / `?lesson=` params. |
| `/learn/[publicId]/reviews`          | `learn/[publicId]/reviews`                    | Public, paginated; creator reply.                                                                   |
| `/courses`                           | `(tabs)/courses`                              | Creator's courses.                                                                                  |
| `/courses/add`, `/courses/[id]/edit` | `courses/add`, `courses/[publicId]/edit`      | Course editor (the largest screen, see Phase 5).                                                    |
| `/lessons`                           | `lessons`                                     | Searchable, paginated lesson list.                                                                  |
| `/students`                          | `students`                                    | Student list + stats.                                                                               |
| `/notifications`                     | `notifications`                               | History, mark all read, unread dot on the tab/header.                                               |
| `/profile`, `/profile/edit`          | `(tabs)/profile`, `profile/edit`              | Includes delete account.                                                                            |
| `/settings`                          | `settings`                                    | Language, theme, content behavior, notification categories.                                         |
| `/invite/[token]`                    | `invite/[token]`                              | Deep link target; invite-aware login/signup.                                                        |
| `/ai-connect`                        | `ai-connect` (Phase 7)                        | Personal access token list/create/revoke.                                                           |
| `/oauth/authorize`                   | — (web only)                                  | OAuth consent for MCP clients happens in a browser.                                                 |
| `/feedback`                          | — (stub on web too)                           | Skip until web has it.                                                                              |

Tabs: **Home, Learn, Courses, Notifications, Profile**. Settings, Students, Lessons, and AI Connect are reached from Profile (this matches the web mobile nav; confirm while building Phase 2).

## Phases

Each phase ends with a runnable dev build on both platforms.

### Phase 1: Foundation (monorepo wiring + app shell)

- Rename the app in `app.json` (name, slug, `scheme: "coursehub"`, bundle IDs `ios.bundleIdentifier` / `android.package`). Delete the template screens and components.
- Add workspace deps: `@repo/api-client`, `@repo/contract`, `@repo/shared`, `@repo/i18n`, `@repo/ui-native`, `@repo/ui-theme`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`.
- Configure Metro for the pnpm monorepo (`watchFolders` at the repo root, node_modules resolution). Check `npx expo-doctor` for duplicate `react` / `react-native` copies.
- Install NativeWind and wire `@repo/ui-theme` tokens + `global.css`. **Decided:** stay on NativeWind v4 (Tailwind 3) with a separate native Tailwind config. `apps/native/tailwind.config.js` uses `nativeTailwindPreset` from `@repo/ui-theme/tailwind`, generated from `THEME`, so web and native share token values without sharing a Tailwind version.
- `@repo/api-client/src/env.ts`: read `EXPO_PUBLIC_API_URL` when `NEXT_PUBLIC_API_URL` is unset. Expo only inlines `EXPO_PUBLIC_*`. Add `apps/native/.env.example`.
- Root providers: React Query (`ApiClientProvider`), i18n (`@repo/i18n` native entry), theme (light/dark/system from preferences), `sonner-native` toaster, safe area, gesture handler.
- Turbo/CI: add `typecheck` (`tsc --noEmit`) and `lint` scripts to `apps/native` so `pnpm typecheck` / `pnpm lint` cover it.
- EAS project + `eas.json` with `development` / `preview` / `production` profiles.

### Phase 2: Auth, session, and navigation

- Token storage in `expo-secure-store` (the native counterpart of `apps/web/utils/token-storage.ts`), registered with `configureTokenProviders` the same way `auth-token-provider.tsx` does it (refresh via `/v1/auth/refresh`).
- Auth gate with Expo Router protected routes: public routes (home, auth, invite, public course page) versus signed-in routes. `onUnauthorized` clears tokens and redirects to login with `next`.
- Login, signup (with language/theme), signout. Apply saved preferences on login, as web does.
- Tab + stack navigation skeleton from the screen map; the header shows the notifications bell with the unread dot.
- Deep link config (custom scheme now; universal/app links in Phase 7).
- Network status toast (`@react-native-community/netinfo`), the counterpart of `network-provider.tsx`.

### Phase 3: Learner read path

- Home catalog, Learn (Enrolled + Explore with filters), shared `CourseCard` / `CourseStats` / progress bar components.
- Course reader: topic/lesson tree with status icons, course/topic/lesson content, URL-param selection, jump to `lastLessonId`.
- Enroll / withdraw, enrollment status, the enroll hint for non-enrolled visitors.
- **Video**: `expo-video` plays the Cloudflare Stream HLS `playbackUrl` (`.m3u8`) natively. Port the progress rules from task 7: resume from `progressSeconds`, save at most every 10 s, on pause, and on leave, and send `videoWatched: true` on end.
- **Documents**: open signed URLs with `expo-web-browser` (in-app browser); no in-app PDF viewer.
- Progress: status dropdown, the "next step" button, derived topic/course status.
- Course-done celebration: congratulations dialog + confetti. The web `canvas-confetti` has no native build, so use a small reanimated animation or a native confetti library; pick one in the phase spec.
- Invitations: `invite/[token]` lookup → accept (invite-aware login/signup).

### Phase 4: Quizzes, reviews, profile, settings

- Learner quiz: `single` / `multiple` / `text` questions, save answers, result card (score, correct answers), clear answers.
- Reviews: review dialog (stars + comment), reviews list screen, creator reply (write/edit/delete).
- Profile view/edit and delete account. Avatar upload stays out, because web doesn't have it yet.
- Settings: language and theme apply live; content behavior; notification category switches (all-courses rows).

### Phase 5: Creator path (course editor)

- Courses list, create, edit with auto-save, status (draft → published → archived), visibility, duplicate, delete, the AI access switch.
- Topics and lessons: CRUD, duplicate, reorder. **Reorder UI:** start with move up/down actions and use the existing `position` endpoints. Add drag-to-reorder only if it's actually needed.
- **Uploads** (same presigned-URL flows as web; only the file source changes):
  - Thumbnail → R2: `expo-image-picker`, then a `PUT` of the local file URI.
  - Video → Cloudflare Stream: `expo-image-picker` (video) or `expo-document-picker`, then an XHR `FormData` POST with upload progress (the port of `upload-to-cloudflare.ts`). Webhook-driven status polling as on web (`get-video-refetch-interval`).
  - Documents → R2: `expo-document-picker`, multi-file, reorder, delete.
- Quiz editor: AI create (`POST /v1/quizzes/.../generate`), manual create, edit, regenerate, delete.
- Lessons screen (search + pagination) and Students screen (list + stats).

### Phase 6: Notifications (backend + native)

The backend currently sends Web Push only. Native needs push delivery through APNs/FCM.

- **Backend (following the root CLAUDE.md order):**
  1. `packages/db-schema`: store Expo push tokens next to Web Push subscriptions. The option to evaluate first: a `platform` column plus a nullable `expoPushToken` on `push_subscriptions`. The other option is a separate `native_push_tokens` table. The user runs `pnpm db:generate`.
  2. `@repo/contract`: extend the subscribe schema with a native token variant (it keeps the Web Push `subscription` variant).
  3. `notificationsService`: fan out to Web Push **and** the Expo Push API (`https://exp.host/--/api/v2/push/send`, or the `expo-server-sdk` package), and prune tokens that come back `DeviceNotRegistered` (the counterpart of the 404/410 pruning).
  4. `pnpm api-client:generate`.
- **Native**: `expo-notifications` permission + token registration; the opt-in prompts after publish and after enroll (the counterparts of `notification-prompt.tsx`); tapping a notification deep-links to its `url`; the unread count polls every 30 s only while the app is in the foreground (`AppState`); the notification history screen; a status card that shows the OS permission state instead of the browser one.
- Update `apps/api/.env.example` if an Expo access token is used.

### Phase 7: Parity polish and release

- AI Connect: token list/create (shown once, with copy to clipboard via `expo-clipboard`)/revoke, plus the MCP config snippets.
- Universal links (iOS associated domains) and Android app links on the web domain, so shared `/learn/...` and `/invite/...` URLs open the app. This needs `apple-app-site-association` / `assetlinks.json` served by `apps/web/public` (add them to the `proxy.ts` matcher exclusions).
- App icon, splash, and store metadata; both locales in store listings.
- Accessibility pass (labels, dynamic type), dark mode check, small-screen and tablet check.
- EAS Submit to TestFlight / Play internal testing; decide whether to ship over-the-air updates with `eas update`.
- Docs: update `ARCHITECTURE.md` (native app is back, `ui-native` is used), `FEATURES.md` (a native column or section per feature), the root `CLAUDE.md` "Gotchas" line that says there is no native app, and `packages/ui-native/AGENTS.md`.

## Non-goals

- The OAuth consent page (`/oauth/authorize`) and the MCP server stay web/API only.
- Features that are stubs on web (feedback, password reset, Google OAuth, avatar upload, admin user management). They come to native only after web has them.
- Offline mode or downloaded lessons.
- A shared UI layer between web and native (`react-native-web` / Solito). The two clients share logic and types, not components.
- The Expo web target. `apps/web` remains the web client.

## Backend changes summary

| Change                                  | Phase | Needs migration    |
| --------------------------------------- | ----- | ------------------ |
| `api-client` env reads `EXPO_PUBLIC_*`  | 1     | no                 |
| Native push tokens (schema + service)   | 6     | yes (user runs it) |
| Universal-link association files in web | 7     | no                 |

Everything else uses existing endpoints unchanged.

## Risks and open questions

- ~~**NativeWind / Tailwind version split** (Phase 1)~~: resolved. Native stays on Tailwind 3 and gets its tokens from `@repo/ui-theme/tailwind` (see Phase 1).
- **pnpm + Metro**: symlinked workspaces and hoisting. May need `node-linker=hoisted` scoped to the app, or Metro `resolver` tweaks. Check with `expo-doctor`.
- **Duplicate React copies**: `@repo/shared` / `@repo/api-client` peer on `react`; make sure native resolves a single `react@19.2.3`.
- **`@repo/i18n` native entry** hasn't run since the old app was removed. Check that it resolves under Metro (`react-native` export condition) and that `i18next-react-native-language-detector` still works on RN 0.86; otherwise use `expo-localization`.
- **Large-file uploads** on mobile networks: Cloudflare Stream basic upload has size limits. Tus (resumable) uploads may be needed for long videos; decide in Phase 5.
- **App Store review**: the app needs account deletion (it exists) and a working demo login for reviewers.

## Verification (per phase)

- `pnpm --filter native typecheck`, `pnpm --filter native lint`, `npx expo-doctor`.
- Manual run on the iOS simulator and the Android emulator through the development build, covering the flows added in that phase in both `en` and `sr` and in light and dark themes.
- Backend phases: `pnpm --filter api build`, `pnpm api-client:generate`, `pnpm typecheck`.

## Proposed task breakdown

| Task   | Scope                                                |
| ------ | ---------------------------------------------------- |
| task-1 | Phase 1: foundation                                  |
| task-2 | Phase 2: auth, session, navigation                   |
| task-3 | Phase 3: learner read path (reader, video, progress) |
| task-4 | Phase 4: quizzes, reviews, profile, settings         |
| task-5 | Phase 5: creator editor + uploads                    |
| task-6 | Phase 6: native push notifications                   |
| task-7 | Phase 7: polish, deep links, release                 |
