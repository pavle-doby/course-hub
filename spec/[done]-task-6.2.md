# Task 6.2: Notification History (Amendment to Task 6)

Amendment to `spec/[done]-task-6.1.md`. Scope: add persistent in-app notification history on top of the push-only system from Task 6. The push plumbing (VAPID, subscription preferences, service worker) is untouched.

## Decisions

- History recipients are the **same opted-in sets** as push: a user only receives history for events they enabled notifications for. One recipient concept feeds both the persisted rows and the push sends. Recording all events regardless of opt-in is a separate, larger behavioral change and not part of this amendment.
- The `/notifications` page becomes a real history list; users can mark items read.
- Notification title/body are stored localized at insert time by reading each recipient's `user_preferences.language`, so history rows and push payloads are consistent with the hardcoded copy map from Task 6.
- Push `data.url` and the history row's `url` are the same deep-link target.
- No retention or pruning of old history rows this release; add when volume matters. (`ponytail:` marker.)

## Data Model

Add to `packages/db-schema/src/schemas/` a `notifications` table:

- `id` UUID primary key, default random.
- `userId` foreign key → `users.id`, `onDelete: "cascade"`.
- `category` `notificationCategoryEnum`, not null.
- `courseId` foreign key → `courses.id`, `onDelete: "cascade"`.
- `title` and `body` text, not null.
- `url` text, not null (deep-link target, e.g. `/learn/{publicId}`).
- `readAt` nullable timestamp.
- `createdAt` timestamp (`{ withTimezone: true }`).
- Index on `(userId, readAt)`.

Update `relations.ts`, `schemas/index.ts`, and `types.ts`. Task 6 already shipped its migration (`0004_push_notifications.sql`), so this amendment needs its own migration (`pnpm db:generate --name notifications`, run by the user).

## Contracts And API

Extend the `notifications` feature in `packages/contract`:

- `GetNotificationsRes`: paginated list of `Notification { id, category, courseId, title, body, url, readAt, createdAt }` plus an `unreadCount`. The nav bell reads `unreadCount` from `GET /v1/notifications?limit=1`, so there's no separate count endpoint.
- No new error codes: both endpoints only touch the current user's rows.

Endpoints (same module, all through `handleAuth`, validated from `res.locals`):

- `GET /v1/notifications` — paginated list for the current user, newest first, using the existing `pagination()` middleware.
- `POST /v1/notifications/read`: marks all of the current user's unread notifications read. There's no body and no per-id marking, because the only caller is the page's mark-all-on-open. (`ponytail:` add `ids` when a per-item action exists.)

Register paths in OpenAPI, then run `pnpm api-client:generate`. Never manually edit `packages/api-client/src/generated/`.

## Send Path

The five `notifyX(...)` helpers (`notifyCourseEnrolled`, `notifyCourseCompleted`, `notifyPrivateCourseAttempt`, `notifyCourseUpdated`, `notifyCreatorNewCourse`) change from push-only to:

1. Compute recipients: same opted-in sets as Task 6, but push subscriptions are **left**-joined so opted-in users whose subscriptions expired (404/410 cleanup) still get history rows. Each row carries `userId`.
2. Insert a `notifications` row per recipient with localized title/body and the deep-link `url`.
3. Push to each recipient's subscribed devices as before (payload carries the same `url`).

Both steps remain fire-and-forget after the triggering database write, failures never propagated.

## Web Application

- Replace the stub `apps/web/app/notifications/page.tsx` with a real list (shadcn `card`/`separator`/`button`, page pagination) using the generated hooks; mark-all-read on open.
- Add a bell with an unread badge (count query) to `SideNavMenu` (desktop) and `MobileHeader` (mobile). `MobileBottomNav` is skipped because a second bell on the same mobile screen is redundant. `nav.notifications` and the `/notifications` header title already exist.
- Unread rows stay highlighted for the current visit: mark-all-read refreshes only the bell count, not the open list.
- `notificationclick` in `sw.js` already opens the payload URL; that URL now resolves to the real history/deep-link target.
- Add i18n keys for the history list UI to `packages/i18n/src/locales/{en,sr}`.

## Delivery Order (after Task 6)

1. Add the `notifications` table schema and relations; extend contract types. The user runs `pnpm db:generate --name notifications`.
2. Add the two history endpoints and the repository read/insert helpers.
3. Add the per-recipient insert step to the five notify helpers (with locale lookup).
4. Register OpenAPI and run `pnpm api-client:generate`.
5. Build the `/notifications` list page and nav bell/badge.
6. Verify and run `pnpm build`, `pnpm lint`, and `pnpm typecheck`.

## Verification (in addition to Task 6)

- Events the user opted into appear in `/notifications` and are marked read after visiting.
- Unread count falls after opening the list.
- History items, push payloads, and click targets share the same deep link.
- Disabling a preference stops both pushes and new history rows for that `(course, category)`.
- Older unread items appear after pagination; reading persists across sessions.

## Follow-up: All-Courses Preferences (Settings)

- `notification_preferences.courseId` is nullable; `null` means all courses. The unique `(userId, courseId, category)` is `NULLS NOT DISTINCT`. This needs its own migration (`pnpm db:generate --name notification_preferences_all_courses`), generated after `0013_notifications`.
- `POST /v1/notifications/subscribe` with no `courseId` enables a category for all courses. `DELETE` with no `courseId` removes the category everywhere, including per-course rows. `subscription` is optional on `DELETE`.
- `GET /v1/notifications/preferences` returns `{ categories }` enabled for all courses.
- All-courses rows only match related users: the course creator for `course_enrolled`/`private_course_attempt`, active enrollees for `course_updated`, and active learners of the creator's courses for `creator_new_course`.
- The Settings "Notifications" card lists the four categories with switches. They're disabled when the browser blocks notifications or doesn't support them.
- Push is best-effort. `subscription` is optional on `POST /v1/notifications/subscribe`, and the web sends it only when push permission and subscription succeed. Settings switches work even when push is blocked, and an alert explains that notifications still appear in the app.
- The nav unread count (`useUnreadNotificationsCount`) polls every 30s (`refetchInterval`). Polling pauses while the tab is hidden and refetches on focus.
