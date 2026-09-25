# Task 7: Learner Progress Tracking

Scope: enrolled learners track progress per lesson. Topic and course status follow automatically from lesson status. Lesson videos mark the lesson done when watched to the end and resume from the last watched position.

## Decisions

- **Lesson status is the only stored status.** `todo | in_progress | done` lives on `lesson_progress`. No row means `todo`.
- **Topic and course status are derived, not stored.** They are computed from lesson statuses on every read, so they stay correct when a creator adds, removes, or reorders lessons. There is no sync code to keep in step.
  - Topic: all lessons `done` → `done`; all `todo` → `todo`; otherwise `in_progress`. Topics with no lessons have no status and are ignored.
  - Course: every lesson in the course `done` (and at least one lesson) → `done`; all `todo` → `todo`; otherwise `in_progress`. This is the same as "all non-empty topics done".
- **Course completion is persisted once, on the existing `course_enrollments.completedAt`.** After every lesson status write, the service sets `completedAt = now()` when the course becomes done and clears it when it stops being done. This fills the "completed" date the Students page already shows. `ponytail:` creator edits (new lesson added to a completed course) do not recompute `completedAt`; the learner-facing derived status is still correct.
- **Manual status is always allowed**, including on video lessons. Video events only move status forward (`todo → in_progress` on play, `→ done` on end) and never downgrade a manual choice.
- **"Watched the whole video" = the `ended` event fires.** No watched-range tracking: a learner who can set Done manually gains nothing by scrubbing, so the check stays simple. `ponytail:` marker at the handler.
- **Only lesson videos are tracked.** Course- and topic-level videos play as today with no resume. `lesson_progress` is keyed by lesson.
- **Resume position is `lesson_progress.progressSeconds`.** It is saved while playing at most every 10 s, on pause, and when the lesson is left (unmount or selection change). Up to 10 s can be lost on a hard tab close; that's accepted, because `sendBeacon` can't carry the bearer token. On `ended`, position resets to `0` so a finished lesson replays from the start.
- **The client is trusted for status and position.** The server only checks that the user is actively enrolled in the lesson's course.
- **Progress rows survive withdraw/re-enroll**, so re-enrolling resumes where the learner left off.
- **`course_progress` table is left untouched** (unused before and after). See Open Questions.

## Supported Flows

| Trigger                                           | Effect                                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Learner picks a status in the lesson dropdown     | Lesson status saved; topic/course status and tree icons refresh                      |
| Learner starts playing a lesson video (`todo`)    | Lesson → `in_progress`                                                               |
| Video playing / paused / lesson left              | `progressSeconds` saved (throttled 10 s while playing)                               |
| Video reaches the end (`ended`)                   | Lesson → `done`, `progressSeconds` → 0                                               |
| Learner reopens a lesson with saved position      | Video seeks to `progressSeconds` on `loadedmetadata`                                 |
| Last lesson of a topic becomes `done`             | Topic shows `done` (derived)                                                         |
| Last lesson of the course becomes `done`          | Course shows `done`; `course_enrollments.completedAt` set (visible on Students page) |
| A done lesson is set back to `todo`/`in_progress` | Topic/course leave `done`; `completedAt` cleared                                     |

## Data Model

`packages/db-schema/src/schemas/`:

- `enums.ts`: add `lessonProgressStatusEnum = pgEnum("lesson_progress_status", ["todo", "in_progress", "done"])`.
- `lesson-progress.ts`:
  - add `status: lessonProgressStatusEnum("status").notNull().default("todo")`;
  - **remove** `completed` boolean (replaced by `status`; no code reads or writes it);
  - keep `progressSeconds`, `startedAt`, `lastWatchedAt`, `completedAt` (set when status becomes `done`, cleared otherwise);
  - add standard `updatedAt` (`{ withTimezone: true }`).
- Export the enum from `schemas/index.ts`. `LessonProgressEntity` in `types.ts` already exists.
- Fix the naming slip in `relations.ts`: `usersRelations.lectureProgress` → `lessonProgress`.

Migration: **user runs** `pnpm db:generate --name lesson_progress_status`. The table has no writers today, so dropping `completed` loses no data.

## Contracts And API

`packages/contract/src/progress/` (`schemas.ts`, `types.ts`, `errors.ts`, `index.ts`; re-export from `src/index.ts`):

- `LessonProgressStatusSchema`: from the enum.
- `LessonProgressSchema`: `createSelectSchema(lessonProgress).pick({ lessonId, status, progressSeconds })`.
- `CourseProgressSchema`: `{ status, topics: { topicId, status }[], lessons: LessonProgressSchema[] }`.
- `UpdateLessonProgressBodySchema`: `{ status?: LessonProgressStatus, progressSeconds?: int ≥ 0 }`, refined so at least one field is present.
- `ErrorCodeProgress { LESSON_NOT_FOUND = "progress_lesson_not_found" }`. For "not enrolled", reuse `ErrorCodeEnrollment.NOT_ENROLLED`.
- Wire the new code into `packages/shared/src/consts/progressErrorMessages.ts` → `allErrorMessages.ts`, plus `errors.progress.*` in `en` and `sr` `common.ts`.

`apps/api/src/modules/progress/` (repository → service → controller → routes → openapi). Private routes are mounted at `/v1/progress` in `src/routes/apiRoutes.ts`, and the OpenAPI file is imported in `src/openapi/spec.ts`. Register `CourseProgress` and `LessonProgress` in `src/openapi/schemas.ts`.

| Endpoint                             | Behavior                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v1/progress/courses/:publicId` | Requires active enrollment. One query joins topics → lessons ⟕ user's `lesson_progress`; the service derives topic and course status. Returns `CourseProgress`.                                                                                                                                                             |
| `PUT /v1/progress/lessons/:lessonId` | Resolves lesson → topic → course, requires active enrollment. In one transaction: upsert on `(userId, lessonId)` (`status` → `completedAt`; `progressSeconds` → `lastWatchedAt`), then, only if `status` was sent, recompute course completion and set or clear `course_enrollments.completedAt`. Returns `LessonProgress`. |

Keep the derivation rules in one pure helper in the service (`deriveStatus(statuses[])`), used for both topics and course.

Then run `pnpm api-client:generate` and re-export the new `progress` tag module from `packages/api-client/src/index.ts`.

## Web

All changes are in `apps/web/app/learn/[publicId]/` unless noted.

- `page.tsx`: `useGetCourseProgress({ publicId }, { query: { enabled: isEnrolled } })`. Build `Map`s from lesson and topic ID to status, and pass them down with the course status.
- `components/progress-status-icon.tsx`: lucide `Circle` / `CircleDot` / `CircleCheck` per status, with an `aria-label` from i18n.
- `components/lesson-status-select.tsx`: a `DropdownMenu` + `DropdownMenuRadioGroup` from `@repo/ui-web` (no new `select` primitive needed). Its trigger is a `Button` showing the icon and label. It calls `useUpdateLessonProgress` and, on success, invalidates the course-progress query key. Errors go through `useErrorHandlingQuery`/toast as elsewhere on the page.
- `components/learn-working-area.tsx`:
  - Title row becomes `flex items-center justify-between gap-2`: `<h2>` + `LessonStatusSelect` (lesson selected and enrolled). When a topic or the course is selected, show a read-only `Badge` with the status icon.
  - The lesson `<video>` gets a `ref` wired to the hook below. Course and topic videos are unchanged.
- `apps/web/hooks/use-lesson-video-progress.ts`: `(videoRef, lessonId, progress) → handlers` for `onLoadedMetadata` (seek), `onPlay` (`todo → in_progress`), `onTimeUpdate` (throttled 10 s save), `onPause` (save), `onEnded` (`done`, position 0). It flushes position on unmount or `lessonId` change. Position-only saves **don't** invalidate the progress query; only status changes do.
- `components/learn-tree-nav.tsx`: add a `ProgressStatusIcon` next to each lesson and topic, and next to the course row when enrolled.
- i18n: `learn.progress.{status,todo,inProgress,done}` in `packages/i18n/src/locales/{en,sr}/learn.ts`.
- Follow web conventions: named `handleX` handlers, no inline JSX logic, and `md` breakpoint for any layout switch.

## Verification

- `pnpm typecheck`, `pnpm lint`, `pnpm turbo build --filter=api... --filter=web...`.
- Manual, as an enrolled learner:
  1. Set lesson statuses via the dropdown; tree icons and topic/course badges update without reload.
  2. Mark every lesson in one topic done → topic done. Do it for all topics → course done, and the creator's Students page shows the completed date. Set one lesson back → course not done, date cleared.
  3. Play a lesson video from `todo` → `in_progress`. Pause at ~1 min, switch lessons, come back → resumes near 1 min. Reload the page → still resumes.
  4. Watch to the end → lesson `done`; reopen → plays from start.
  5. Not enrolled or withdrawn → progress endpoints return `enrollment_not_enrolled`; no dropdown is shown.
- Update `FEATURES.md`: move "Progress tracking" from partial to fully implemented.

## Out of Scope

- Progress for course- and topic-level videos.
- Progress percentage on enrolled course cards / "continue where you left off".
- Anti-skip watched-range tracking.
- Creator-side analytics beyond the existing `completedAt` column.

## Open Questions

1. **Drop the unused `course_progress` table** in the same migration? Recommended: yes (YAGNI; everything it models is derived now). It is kept only because deleting a table is your call.
2. **Enrolled course cards**: show course status/progress there too? Cheap once `GET /v1/progress/courses/:publicId` exists, but it needs a batch endpoint to avoid N requests. Deferred.

## Amendment: Shareable Selection And Resume

- The reader selection lives in the URL: `/learn/<publicId>?topic=<id>` or `?lesson=<id>` (`apps/web/hooks/use-selection-search-param.ts`). Changes use `router.replace`, so the header Back button still leaves the course. A shared link applies once the viewer is enrolled and the item exists; otherwise the course view shows.
- `CourseProgress.lastLessonId` is the lesson whose `lesson_progress.updatedAt` is most recent (video position saves and status changes). There is no schema change.
- Opening a course with no topic or lesson in the URL redirects once to `lastLessonId`. Explicit links and later clicks on the course row are never overridden.
