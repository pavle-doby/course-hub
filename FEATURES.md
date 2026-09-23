# Features

Fully implemented features and what is still in progress.

## Fully implemented (all layers: DB → repo → API → contract → OpenAPI → generated hooks → web UI)

- **Auth** — email/password signup, login, signout, refresh. Supabase JWT verified per-request by `handleAuth` on every private route. Signup picks language + theme (defaulted from browser); login/signup responses return saved preferences and apply them. Web: `apps/web/app/auth/[mode]/`.
- **User profile & account** — view/edit profile (firstName, lastName, username, bio), delete own account. `apps/api/src/modules/users/`, `apps/web/app/profile/`.
- **Course authoring** — CRUD, draft→published→archived, public/private visibility, auto-save editor, duplicate. `apps/api/src/modules/courses/`, `apps/web/app/courses/`.
- **Course thumbnail (Cloudflare R2)** — initialize → direct upload → verify → save/delete. `apps/api/src/modules/courses/`.
- **Topics management** — CRUD, `position` reorder, duplicate. `apps/api/src/modules/topics/`.
- **Lessons management** — CRUD, reorder, duplicate, standalone searchable list with pagination. `apps/api/src/modules/lessons/`, `apps/web/app/lessons/`.
- **Public course catalog** — search + paginated list of published courses; Explore tab with other-creators / exclude-enrolled filters. `apps/web/app/page.tsx`, `apps/web/app/learn/explore/`.
- **Enrollment & enrolled-course reader** — self-enroll (public only; private needs invitation), withdraw, status check, enrolled list, learner detail page with topic/lesson tree, video player, documents. Content stripped server-side for non-enrolled visitors. `apps/api/src/modules/enrollments/`, `apps/web/app/learn/`.
- **Students & creator stats** — student list (avatar, course, dates) + enrollment/student counts. `apps/web/app/students/`.
- **Invitations to private courses** — email invite, one-time share link, revoke, accept, public lookup by token, invite-aware signup/login. `apps/api/src/modules/invitations/`, `apps/web/app/invite/`.
- **Videos (Cloudflare Stream)** — one video per course/topic/lesson, direct upload, webhook-driven `uploading → processing → ready/error`, live progress, playback, delete. `apps/api/src/modules/videos/`.
- **Documents (Cloudflare R2)** — multi-file per course/topic/lesson, direct upload, drag-to-reorder, signed public URLs, delete. `apps/api/src/modules/documents/`.
- **User preferences / settings** — `GET`/`PUT /v1/users/preferences` (language, theme, content behavior); row created in the signup transaction. Settings page applies theme/language live. `apps/api/src/modules/users/`, `apps/web/app/settings/`.
- **Localization (en / sr)** — `@repo/i18n` locales across web UI, error messages, and settings. `packages/i18n/`.
- **Push notifications (Web Push / VAPID)** — per `(user, course, category)` opt-in via `POST`/`DELETE /v1/notifications/subscribe`; device subscriptions in `push_subscriptions`, dead ones pruned on 404/410; copy localized per recipient's `user_preferences.language`. Fire-and-forget triggers: self-enroll → creator (`course_enrolled`), private-course enroll attempt → creator (`private_course_attempt`), published course updated → enrolled users (`course_updated`), new course published → creator's learners (`creator_new_course`). Opt-in prompts after publish (course editor) and after enroll (learn page); `sw.js` handles `push` / `notificationclick`. `apps/api/src/modules/notifications/`, `apps/web/components/notification-prompt.tsx`, `apps/web/services/notifications-service.ts`. Spec: `spec/task-6.1.md`.
- **Health endpoint** — `GET /api/v1/health` (infra).

## Partially implemented / in progress

- **Progress tracking** — `course_progress` / `lesson_progress` tables only; no API module, contract schemas, hooks, or UI.
- **Feedback** — `apps/web/app/feedback/` is a stub, no API.
- **Notification history** — `apps/web/app/notifications/` still renders "Coming soon..."; no `notifications` table, list/mark-read endpoints, or nav unread badge yet (planned in `spec/task-6.2.md`). No UI to manage/disable existing push opt-ins outside the prompts.
- **Invitation-accept notifications** — accepting an invite enrolls without notifying the creator (intentional for now; `ponytail:` marker in `invitationsService`).
- **Password reset** — forgot-password form only; no submit handler / API endpoint (Supabase `resetPassword` never called).
- **Google OAuth login** — button rendered in login form; no backend wiring.
- **Avatar photo upload** — "Change photo" is an `alert()` placeholder; `users.avatarUrl` exists but no upload flow.
- **Admin user management** — `/api/v1/users*` admin endpoints + hooks exist; no web pages call them.