# Task 6.1: Push Notifications

## Decisions

- Delivery is native browser Web Push (VAPID) via the existing service worker and the `web-push` npm package. No third-party push provider.
- No queue or worker: push sends are fire-and-forget after the triggering database write, with errors swallowed so a failed push never fails the request.
- Notification opt-in is per `(user, course, category)`. A user can be notified per device (browser push subscription) and per enrolled/created course.
- The `/notifications` page stays a stub this release; there is no in-app notification history.
- Push copy is hardcoded in the API for now (single constants file); per-locale copy can reuse `packages/i18n` later.
- Invite-acceptance enrolls via `invitationsService` (direct repository call) and does not notify the creator this release; only self-enrollment does. `ponytail:` marker in code for the future choke point.

## Supported Flows

| Event                                                              | Recipients (preference)                                                                |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Someone self-enrolls in a course                                   | course creator — `course_enrolled`                                                     |
| Someone tries to self-enroll in a private course without an invite | course creator — `private_course_attempt`                                              |
| An enrolled course is updated                                      | enrolled users — `course_updated`                                                      |
| A creator publishes a new course                                   | users enrolled in any course by that creator (deduped per user) — `creator_new_course` |

Prompts:

- After a creator publishes a course, the app asks whether to enable notifications for it → subscribes `course_enrolled` + `private_course_attempt`.
- After a user enrolls in a course, the app asks whether to enable notifications for it → subscribes `course_updated` + `creator_new_course`.

## Data Model

Add to `packages/db-schema/src/schemas/`:

- `enums.ts`: `notificationCategoryEnum` with `["course_enrolled", "private_course_attempt", "course_updated", "creator_new_course"]`.
- `push-subscriptions.ts` — `pushSubscriptions` table (devices):
  - `id` UUID primary key, default random.
  - `userId` foreign key → `users.id`, `onDelete: "cascade"`.
  - `endpoint` text, not null, unique.
  - `p256dh` and `auth` text, not null.
  - `createdAt` and `updatedAt` timestamps (`{ withTimezone: true }`).
- `notification-preferences.ts` — `notificationPreferences` table:
  - `id` UUID primary key, default random.
  - `userId` foreign key → `users.id`, `onDelete: "cascade"`.
  - `courseId` foreign key → `courses.id`, `onDelete: "cascade"`.
  - `category` `notificationCategoryEnum`, not null.
  - `createdAt` timestamp.
  - Unique `(userId, courseId, category)`.

Update `relations.ts` (user ↔ subscriptions/preferences, course ↔ preferences), `schemas/index.ts`, and `types.ts`. Generate the migration from schema source; do not hand-write or apply it.

## Contracts And API

Add a `notifications` feature to `packages/contract` with Zod schemas, DTO types, and `ErrorCodeNotification` in `errors.ts`:

- `SubscribeNotificationsBody`: `courseId` (uuid), `category` (enum), `subscription` → `{ endpoint, keys: { p256dh, auth } }`.
- `UnsubscribeNotificationsBody`: `courseId`, `category`, `subscription` → `{ endpoint }`.
- Error codes wired into `packages/shared/src/consts/notificationErrorMessages.ts`, spread into `allErrorMessages.ts`, with `errors.notification.*` entries in `packages/i18n/src/locales/{en,sr}/common.ts`.

Create `apps/api/src/modules/notifications/` following the repository, service, controller, routes, OpenAPI conventions. Every route uses `handleAuth`; validated data reads from `res.locals`.

Endpoints:

- `POST /v1/notifications/subscribe` — upsert the device subscription and insert the `(courseId, category)` preference.
- `DELETE /v1/notifications/subscribe` — remove the preference; delete the device row when its last preference is removed.

Server configuration in `apps/api/src/env.ts`, `.env.example`, and `.env.local`:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (`mailto:` contact)

Generate the keypair with `npx web-push generate-vapid-keys`. Add `web-push` (and `@types/web-push`) to `apps/api/package.json`.

Register notification schemas and paths in OpenAPI, import the module from `openapi/spec.ts` side-effect style, mount routes in `routes/apiRoutes.ts`, then run `pnpm api-client:generate`. Never manually edit `packages/api-client/src/generated/`.

## Push Trigger Wiring

Send is `void notificationsService.notifyX(...)` after the triggering write, guarded so failures are never propagated.

- `apps/api/src/modules/enrollments/services/enrollmentsService.ts` — `enrollInCourse`:
  - On successful create/reactivate enrollment → notify the course creator via `course_enrolled`.
  - In the private-course branch, before throwing `ConflictError` (`COURSE_PRIVATE`) → notify the course creator via `private_course_attempt`.
- `apps/api/src/modules/courses/services/coursesService.ts` — `updateCourse`:
  - Draft → published transition → notify users enrolled in any of the creator's courses via `creator_new_course`.
  - Update of an already-published course → notify its enrolled users via `course_updated`.

Lookup flow per send: query `notification_preferences` for `(courseId, category)` → join matching users' `push_subscriptions` → `webpush.sendNotification` per device with `Promise.allSettled`, deleting subscriptions that return 404/410 (Gone).

## Web Application

- `apps/web/public/sw.js`:
  - Fix the pre-existing broken `STATIC_ASSET_PATHS` (non-existent `.svg` icons break `cache.addAll` in production, which blocks SW install and therefore push).
  - Add `push` handler → `self.registration.showNotification(title, { body, icon, badge, data: { url } })`.
  - Add `notificationclick` handler → focus existing client or `clients.openWindow(url)`.
- Expose the VAPID public key: `VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY` in `packages/api-client/src/env.ts`; add `NEXT_PUBLIC_VAPID_PUBLIC_KEY` to `apps/web/.env.example` and `.env`.
- `apps/web/utils/push-subscription.ts`: `urlBase64ToUint8Array` helper and `ensurePushSubscription()` that registers `/sw.js` (registration is idempotent; the subscribe flow must not rely on the production-only `PwaProvider` gate), calls `Notification.requestPermission()`, then `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`, returning `{ endpoint, keys }`.
- `apps/web` prompts via generated hooks:
  - `apps/web/app/courses/components/course-editor.tsx` — after a successful publish, ask "Enable notifications for this course?" → subscribe `course_enrolled` + `private_course_attempt` for that course. Persist the dismissed state in localStorage to avoid nagging on every publish.
  - `apps/web/app/learn/[publicId]/page.tsx` — after a successful enroll, ask → subscribe `course_updated` + `creator_new_course` for that course.
- Add i18n keys for prompt copy and push-facing strings to `packages/i18n/src/locales/{en,sr}`.

## Delivery Order

1. [x] Generate VAPID keypair and add server + web environment values.
2. [ ] Add schema tables, relations, contract types/errors, and generate the migration.
3. [x] Implement `pushService` (web-push init, send, dead-subscription cleanup) and the subscribe/unsubscribe routes.
4. [x] Wire the four push triggers into enrollments and courses services.
5. [x] Register OpenAPI and run `pnpm api-client:generate`.
6. [x] Add a `push`/`notificationclick` handler to `sw.js` and fix the broken static asset list.
7. [x] Add the VAPID public key to the api-client env and web env examples.
8. [x] Build the subscribe helper and the two opt-in prompts.
9. [x] Verify and run `pnpm build`, `pnpm lint`, and `pnpm typecheck`.

## Verification

- A creator who opted in is notified when a user self-enrolls; a user who opted in is notified when an enrolled course is updated and when the creator publishes a new course.
- A private-course enroll attempt triggers a creator notification even though enrollment fails.
- Non-subscribers and users who declined the prompt receive nothing.
- Opting out removes the preference and stops notifications without affecting other devices/preferences.
- Dead push subscriptions are removed on 404/410 responses.
- Cross-device delivery works (two browsers/users) with the dev API over `localhost`.
