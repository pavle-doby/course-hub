# Native App — Task Index & High-Level Plan

Goal: bring `apps/native` (Expo SDK 57, Expo Router, `src/app/`) to feature parity with `apps/web`, reusing the same API, contract, generated hooks, i18n and design tokens. The API stays the single backend; native is a second client of the same `/api/v1/*` endpoints.

Scope reference: [FEATURES.md](../../../FEATURES.md) lists what the web app does. Anything listed there as "Partially implemented" (feedback, password reset, Google login, avatar upload, admin pages) is **out of scope** until web ships it.

## Conventions for native task files

- Task specs live in `apps/native/spec/` as `[todo]-n-task-<n>.md`, renamed to `[in-progress]-…` / `[done]-…` as they move. Keep the index table below in sync.
- Follow `apps/native/AGENTS.md`: read Expo v57 docs before touching Expo APIs, add deps with `npx expo install`, never hand-edit `ios/` / `android/`.
- UI comes from `@repo/ui-native` (NativeWind + rn-primitives). Add missing components there, not in the app.
- Data fetching uses the Orval hooks from `@repo/api-client`. No hand-written fetch calls for endpoints that are in OpenAPI.
- Every user-facing string goes through `@repo/i18n` (`en` + `sr`), reusing the web keys where the text is the same.

## Reuse map (what's shared vs. what native must build)

| Layer                    | Shared as-is                                | Native-specific work                                                                                             |
| ------------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Types / validation       | `@repo/contract`                            | —                                                                                                                |
| API hooks                | `@repo/api-client` generated hooks, mutator | `env.ts` reads `NEXT_PUBLIC_*` only → accept `EXPO_PUBLIC_API_URL` too; token providers wired to SecureStore     |
| Error → message mapping  | `@repo/shared` error hooks / messages       | Check hooks don't import web-only code (`react-hook-form` is fine)                                               |
| i18n                     | `@repo/i18n/native` (already exists)        | Language persisted + applied from user preferences                                                               |
| Theme tokens             | `@repo/ui-theme/native`                     | NativeWind setup in the app, light/dark from preferences                                                         |
| Components               | `@repo/ui-native` (button, card, dialog, …) | Missing: pagination/infinite list, star rating, course card, stats, attachment, bottom sheet actions, toast host |
| Auth tokens              | `/v1/auth/*` endpoints                      | `expo-secure-store` instead of `localStorage`                                                                    |
| Uploads (R2 / CF Stream) | Initialize / verify endpoints               | File pick (`expo-image-picker`, `expo-document-picker`) + direct upload from a file URI                          |
| Video playback           | Cloudflare Stream HLS URL                   | `expo-video` instead of the web player; resume position + "watched to end"                                       |
| Push notifications       | Opt-in / preferences / history endpoints    | **API change**: Expo push tokens next to Web Push (see n-task-9)                                                 |
| Deep links               | Notification `url`, invite links            | Expo Router linking + universal links / app scheme                                                               |

## Phases & tasks

Order is by dependency. Each task ends with `npx tsc --noEmit` and `npx expo lint` in `apps/native`, plus `pnpm typecheck` if a shared package changed.

### Phase 0 — Foundation

Detailed plan and progress log: [n-task-0](<[done]-n-task-0.md>).

| #   | Task                  | Summary                                                                                                                                                                                                                                                                         | State |
| --- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 0   | Workspace wiring      | Clean out the Expo template screens. Metro config for the pnpm monorepo, NativeWind + `@repo/ui-theme/native`, workspace deps (`@repo/*`), `tsconfig` paths, `EXPO_PUBLIC_API_URL` in `.env.example`, turbo tasks. Update CLAUDE.md/ARCHITECTURE.md (they say "no native app"). | done  |
| 1   | App shell & providers | Root `_layout.tsx`: `ApiClientProvider`, i18n, theme, safe area, gesture handler, toast host. Navigation skeleton mirroring web: tabs (Home, Learn, Courses, Notifications, Profile/More) + stacks for detail screens.                                                          | done  |
| 2   | Auth                  | Login / signup screens (language + theme pickers defaulted from device), SecureStore token storage, `configureTokenProviders` refresh + logout, auth-gated route groups (`(auth)` / `(app)`), `next`-style redirect back.                                                       | done  |

### Phase 1 — Learner experience

| #   | Task                      | Summary                                                                                                                                                                                                                                  | State |
| --- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 3   | Catalog & course cards    | Home (public catalog + search), Learn → Explore (other-creators / exclude-enrolled filters) and Enrolled (progress bar). Shared `CourseCard` + `CourseStats` in `@repo/ui-native` or app `components/`. Infinite scroll over pagination. | todo  |
| 4   | Course reader             | `/learn/[publicId]`: overview, topic/lesson tree (drawer or sheet on phone), lesson content, documents (open signed URL), enroll / withdraw, non-enrolled view, jump to last active lesson, `?topic=`/`?lesson=` params.                 | todo  |
| 5   | Video playback & progress | `expo-video` for Stream HLS, resume from last position, send `videoWatched` on end. Lesson status dropdown + "next step" button, derived topic/course status icons, completion dialog + confetti.                                        | todo  |
| 6   | Learner quizzes           | Take quiz at the end of content (single / multiple / text), result card with score and correct answers, clear answers, enroll hint for visitors.                                                                                         | todo  |
| 7   | Reviews                   | Review dialog (1–5 stars + comment), Review button next to Withdraw and in the completion dialog, public reviews list (paginated), creator reply inline.                                                                                 | todo  |
| 8   | Invitations (accept side) | Open invite link → public token lookup → invite-aware login/signup → accept. Needs deep link handling for `/invite/[token]`.                                                                                                             | todo  |

### Phase 2 — Notifications

| #   | Task                            | Summary                                                                                                                                                                                                                                                                                                                                             | State |
| --- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 9   | Native push (API + app)         | **Full-stack.** API today stores Web Push subscriptions only. Add an Expo push token device type (`push_subscriptions` or a new table → user runs `pnpm db:generate`), send via Expo Push API alongside `web-push`, prune dead tokens. App: `expo-notifications` permission + token, opt-in prompts after publish/enroll, tap → deep link to `url`. | todo  |
| 10  | Notification history & settings | Notifications tab (history, mark all read on open, unread badge polling while foregrounded), empty-state permission card, Settings per-category switches for all courses.                                                                                                                                                                           | todo  |

### Phase 3 — Account

| #   | Task               | Summary                                                                                                          | State |
| --- | ------------------ | ---------------------------------------------------------------------------------------------------------------- | ----- |
| 11  | Profile & settings | View / edit profile, delete account, preferences (language, theme, content behavior) applied live and persisted. | todo  |
| 12  | AI Connect         | Personal access tokens: list, create (shown-once, copy to clipboard), revoke; MCP config snippets (copy only).   | todo  |

### Phase 4 — Creator experience

| #   | Task                       | Summary                                                                                                                                                                                                                        | State |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| 13  | Creator course list        | `/courses`: my courses with stats, create, duplicate, archive/delete, publish state and visibility, actions in a bottom sheet.                                                                                                 | todo  |
| 14  | Course editor              | Add/edit course: tree of topics and lessons (CRUD, reorder, duplicate), entity form with auto-save, publish / visibility / AI access switches. Phone-first layout (tree screen → entity screen) instead of the web split view. | todo  |
| 15  | Media uploads              | Thumbnail (image picker → R2), documents (document picker → R2, reorder, delete), videos (picker → Cloudflare Stream direct upload, status polling until `ready`).                                                             | todo  |
| 16  | Creator quizzes            | Quiz card in the editor: AI Create (generate endpoint), Manual Create, edit, regenerate, delete.                                                                                                                               | todo  |
| 17  | Invitations (creator side) | Invite by email, create share link (native share sheet), list, revoke.                                                                                                                                                         | todo  |
| 18  | Lessons & students         | Standalone searchable lessons list; students list with avatar, course, dates, completion and creator counts.                                                                                                                   | todo  |

### Phase 5 — Release

| #   | Task             | Summary                                                                                                                                               | State |
| --- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 19  | Offline & polish | Network status banner (web has `network-provider`), loading skeletons, pull-to-refresh, error states, accessibility pass.                             | todo  |
| 20  | EAS build & ship | `eas.json` profiles (development / preview / production), app icons + splash, bundle IDs, universal links / app scheme, push credentials, EAS Update. | todo  |

## Web features intentionally not ported

- **OAuth consent page** (`/oauth/authorize`) — used by MCP clients in a browser; stays web-only.
- **Keyboard shortcuts, resize handles, drag-to-reorder by mouse** — replaced by touch equivalents (long-press reorder or up/down actions) within the tasks above.
- **PWA service worker** (`sw.js`) — replaced by native push (n-task-9).

## Open questions

- Push: extend `push_subscriptions` with a `type` column, or a separate `expo_push_tokens` table? Decide in n-task-9.
- Is `react-native-web` output (`expo start --web`) a target, or iOS/Android only? Affects whether `Platform.select({ web })` branches matter.
- Upload from file URI: confirm the R2 / Stream direct-upload URLs accept a React Native `fetch` / `FormData` upload, or whether `expo-file-system` upload is needed.
