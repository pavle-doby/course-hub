# Task 13: Course Leaderboard (Rang lista)

Scope: the leaderboard UI is **web only**; the API changes are shared, and `apps/native` is updated to send the progress the new gates need (no native leaderboard screen). Each course has one leaderboard that ranks its learners by points earned for consistency, finished lessons/topics/course, and quizzes. Courses with videos and quizzes give more points than text-only courses. Every quiz (lesson, topic, course) and every lesson/topic video blocks completion of its parent until it is passed/watched; only the course-level video doesn't block.

Status legend: `[x]` done · `[ ]` todo · `[~]` needs the user (e.g. DB commands).

## Decisions

- **Points are computed on read, not stored.** The service derives them from data we already keep (`lesson_progress`, `quiz_responses`, `course_enrollments.completedAt`) plus one new table for active days. No points ledger, so there's nothing to keep in sync and nothing to farm: toggling a lesson done → todo → done doesn't add points twice, and clearing a quiz takes its points away.
- **Scoring runs in TypeScript, not SQL.** Quiz scores already come from `scoreQuiz` over `jsonb` answers, so the service loads the course's rows for all active learners, scores them, sorts, ranks and pages in memory. `// ponytail:` note: fine for course-sized enrollments (hundreds); move to SQL or a cached column if a course gets thousands.
- **Who is listed:** every learner who ever enrolled, including those with 0 points. Withdrawn learners stay on the list with their points and place, shown greyed out (`isWithdrawn: true`). The creator isn't listed.
- **Who can see it:** learners with an active enrollment and the course creator (private route, `handleAuth`). Anyone else gets `ErrorCodeEnrollment.NOT_ENROLLED`.
- **Emails are creator-only.** `user.email` is filled only when the viewer is the course creator; for learners it is `null` and the row shows name only.
- **Place:** standard competition ranking (1, 2, 2, 4) on points. Same points are ordered by who earned them first (earliest `lastActivityAt`), then by name.
- **Quiz Redo deducts points.** Quiz points follow the current saved answers. **Redo** (the existing Clear answers, which deletes the `quiz_responses` row) removes that quiz's points and any completion it unlocked, as if the quiz was never done; a retry earns them back from the new score. Nothing extra to store: compute-on-read gives this for free.
- **Consistency = active days.** New table `learner_activity_days (userId, courseId, day date)`, unique on all three. Any lesson progress save or quiz answer save inserts today's row (`on conflict do nothing`). `// ponytail:` the day is the UTC date, not the learner's timezone. Counting starts when this ships; no backfill.
- **Gates, enforced on the server:**

  | Level  | Done when                                                                                                |
  | ------ | -------------------------------------------------------------------------------------------------------- |
  | Lesson | Its ready video (if any) is watched **and** its quiz (if any) has every graded answer right              |
  | Topic  | All its lessons are done **and** its ready video (if any) is watched **and** its quiz (if any) is passed |
  | Course | All topics are done **and** its quiz (if any) is passed. The course video does **not** block.            |

  "Passed" is the existing rule: `scoreQuiz` → `score === total`.

- **Lesson manual Done is gated.** Today the dropdown can still set `done` on any lesson. Now `PUT /v1/progress/lessons/:lessonId` with `status: "done"` on a lesson with a ready video or a quiz is rejected with a new `ErrorCodeProgress.LESSON_NOT_EARNED` (400) unless `getEarnedLessonStatus` returns `done`. `todo` / `in_progress` stay manual; text-only lessons can still be marked done by hand.
- **Topic videos are tracked** in a new `topic_progress (userId, topicId, videoWatchedAt)` table, written by `PUT /v1/progress/topics/:topicId` `{ videoWatched: true }` when the topic video ends. No position resume for topic videos (YAGNI). Course videos stay untracked.
- **Topic and course status are still derived, never stored,** but by one function that also takes the gates above: `deriveCourseStatus(lessons, topicGates, courseGate)` in `progress/services/deriveCourseStatus.ts`. `getCourseProgress`, the completion sync and the leaderboard all use it.
- **Completion sync moves from the repository to the service.** The "is the course done" count inside `progressRepository.saveLessonProgress` can't see quizzes or topic videos, so it is replaced by `progressService.syncCourseCompletion(user, courseId)`. It runs after a lesson status save, a topic video watch, and any quiz save/clear (lesson, topic or course). It loads the course progress, derives the status, sets or clears `course_enrollments.completedAt`, and sends the "course completed" push only when the course newly completes (same `isNull(completedAt)` guard as today).
- **Topic/course quiz saves sync too.** `quizzesService` today calls `syncLessonStatus` only for lesson quizzes; topic and course quizzes now call `syncCourseCompletion`.
- **The `handleEnded` ponytail note changes:** skipping to the end still counts as watched, but now that points depend on it, the comment should say this is a known shortcut instead of "manual Done is allowed anyway".
- **Native:** no leaderboard screen, but the reader sends the same progress updates as web (topic video watched, locked **Done**), see the Native section.

## Points

Constants live in `packages/contract/src/leaderboard/points.ts` (`LEADERBOARD_POINTS`) so the web page can show a "How points work" legend from the same values the API uses.

| Source                                  | Points                                        | Notes                                                                |
| --------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| Active day                              | 5 per day                                     | Distinct `learner_activity_days` rows for the course                 |
| 7-day streak                            | +15 per full run of 7 consecutive active days | A 14-day run = 2 bonuses                                             |
| Lesson done                             | 10                                            | `lesson_progress.status = done`                                      |
| Lesson video watched                    | +5                                            | Lesson has a ready video and `videoWatchedAt` is set                 |
| Topic video watched                     | +5                                            | Topic has a ready video and `topic_progress.videoWatchedAt` is set   |
| Topic done                              | 25                                            | Topic gate above (lessons + topic video + topic quiz)                |
| Course done                             | 100 (text-only) / **150** (rich course)       | `course_enrollments.completedAt` set; "rich" defined below           |
| Quiz finished (course, topic or lesson) | 10 + `round(20 × score / total)`              | A saved response exists; `total = 0` (only text questions) → 10 + 20 |

**Rich course** = the course has at least one ready video **and** at least one quiz (any level). Within one course every learner gets the same multiplier, so "extra points for rich courses" mostly shows up through the per-lesson video points, the quiz points and the larger completion bonus. It matters across courses if a global ranking ever comes later.

## Supported Flows

| Trigger                                                             | Effect                                                                       |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Learner saves lesson progress or quiz answers                       | Today's `learner_activity_days` row inserted (once per day)                  |
| Learner picks **Done** in the dropdown on a lesson with video/quiz  | Option disabled with a hint; if forced via API → `LESSON_NOT_EARNED` toast   |
| Topic video plays to the end                                        | Topic video marked watched; course completion re-checked                     |
| Learner saves/clears a topic or course quiz                         | Course completion re-checked (can complete or un-complete the course)        |
| Learner or creator clicks **Leaderboard** in the reader tree header | Opens `/learn/:publicId/leaderboard` (above the **Reviews** link, same menu) |
| Leaderboard page (learner)                                          | Place, points, avatar, full name; own row highlighted and pinned if off-page |
| Leaderboard page (creator)                                          | Same, plus each learner's email                                              |
| A learner withdraws                                                 | Stays on the list with their place, row greyed out with a "Withdrawn" badge  |
| Learner opens **How points work**                                   | Popover listing `LEADERBOARD_POINTS`                                         |

## Data Model

`packages/db-schema/src/schemas/`:

- `learner-activity-days.ts` → `learner_activity_days`: `id`, `userId` (fk users, cascade), `courseId` (fk courses, cascade), `day date not null`; `unique(userId, courseId, day)`.
- `topic-progress.ts` → `topic_progress`: `id`, `userId` (fk users, cascade), `topicId` (fk topics, cascade), `videoWatchedAt timestamptz` nullable, `updatedAt`; `unique(userId, topicId)`.
- Export from `schemas/index.ts`; relations (`users.activityDays`, `courses.activityDays`, `learnerActivityDays.user/course`, `users.topicProgress`, `topics.progress`, `topicProgress.user/topic`); `LearnerActivityDayEntity` and `TopicProgressEntity` in `types.ts`.

Migration: **user runs** `pnpm db:generate --name leaderboard` (covers both tables).

Existing completions: a learner whose course is already `completedAt` but would now fail a topic/course gate is un-completed the next time `syncCourseCompletion` runs for them, not retroactively.

## Contracts And API

`packages/contract/src/leaderboard/` (`schemas.ts`, `types.ts`, `points.ts`, `index.ts`; re-exported from `src/index.ts`):

- `LeaderboardEntrySchema`: `{ place, points, isWithdrawn, user: CourseCreatorSchema.extend({ email: z.email().nullable() }) }` (`email` null unless the viewer is the creator).
- `CourseLeaderboardSchema`: `{ data: LeaderboardEntry[], pagination, me: LeaderboardEntry.nullable() }` (`me` is null for the creator).
- `LEADERBOARD_POINTS` constants (table above).

`packages/contract/src/progress/`: add `LESSON_NOT_EARNED = "progress_lesson_not_earned"` and `TOPIC_NOT_FOUND = "progress_topic_not_found"` → `progressErrorMessages.ts` + `errors.progress.*` in `en` and `sr`. Add `TopicProgressParamsSchema` / `UpdateTopicProgressBodySchema` (`{ videoWatched: z.literal(true) }`) and `isGated` on `LessonProgressSchema`.

`apps/api/src/modules/leaderboard/` (repository → service → controller → routes → openapi):

| Endpoint                                | Behavior                                                                                     |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| `GET /v1/leaderboard/courses/:publicId` | Active learner or creator only. Paginated (`pagination` middleware), returns entries + `me`. |

- `repository/leaderboardRepository.ts` (explicit return types): all enrollments (incl. withdrawn) with user info; their `lesson_progress` and `topic_progress` rows; the course's quizzes and those learners' responses; which lessons/topics have a ready video; their activity days.
- `services/scoreLeaderboard.ts`: pure function, rows in → `{ userId, points }[]`; reuses `scoreQuiz` and `deriveCourseStatus`.
- `services/leaderboardService.ts`: access check, score, sort, rank, slice the page, find `me`, null out emails unless the viewer is the creator.
- Mount private at `/v1/leaderboard` in `apiRoutes.ts`; import `leaderboardOpenapi.ts` in `src/openapi/spec.ts`; register `CourseLeaderboard` in `src/openapi/schemas.ts`.

Changes to existing modules:

- `progressRepository.saveLessonProgress`: drop the course-done count and `isCourseCompleted`; return just the row. Add `saveTopicVideoWatched(userId, topicId)` and `setEnrollmentCompleted(userId, courseId, isDone): Promise<boolean>` (true when it newly completed).
- Activity days: `progressRepository.touchActivityDay(userId, courseId)` (`on conflict do nothing`), called from the lesson save, the topic video save and quiz save/clear. The quiz save needs the quiz's course id; resolve it from the parent in `quizzesService`.
- `progressService.updateLessonProgress`: if `dto.status === "done"` and the lesson has a ready video or quiz, require `getEarnedLessonStatus(...) === "done"`, else throw `BadRequestError({ code: ErrorCodeProgress.LESSON_NOT_EARNED })`. Calls `syncCourseCompletion` after a status change.
- New `progressService.updateTopicProgress` + `PUT /v1/progress/topics/:topicId` (`{ videoWatched: true }`, enrolled only, `ErrorCodeProgress.TOPIC_NOT_FOUND` for a bad id) → saves, then `syncCourseCompletion`.
- `progressService.getCourseProgress`: topic/course status from `deriveCourseStatus`. `lessons[]` gains `isGated: boolean` (ready video or quiz) so the web dropdown can disable **Done** without an extra request.
- `quizzesService` save/clear: lesson parent → `syncLessonStatus` (which now ends with `syncCourseCompletion`); topic/course parent → `syncCourseCompletion`.

Then `pnpm api-client:generate` and re-export the `leaderboard` tag module from `packages/api-client/src/index.ts`.

## Web

- `learn-tree-nav.tsx`: new `leaderboardHref` prop and a **Leaderboard** (`TrophyIcon`) `SidebarMenuItem` **before** the Reviews item in the `SidebarHeader` menu. Pass it from `app/learn/[publicId]/page.tsx` next to `reviewsHref`.
- `lesson-status-select.tsx`: new `isDoneLocked` prop; when set, the **Done** radio item is disabled with a short hint ("Watch the video and pass the quiz"). `learn-working-area.tsx` passes `isGated && status !== "done"`.
- Topic videos: `useLessonVideoProgress` gets an optional `topicId`; with a topic selected (no lesson), `onEnded` calls a new `useSaveTopicProgress(publicId)` (mutation + invalidate course progress). Course video stays untracked.
- `course-completed-dialog` trigger: today it fires when course status turns done after a lesson save; it must also fire after a topic video end or a topic/course quiz save. It already watches the derived course status from the progress query, so invalidating that query after those saves is enough (check `LearnQuiz` invalidates it for topic/course quizzes too).
- `apps/web/app/learn/[publicId]/leaderboard/page.tsx`: same shell as the reviews page (sticky header with back button, `title · course name`, `max-w-2xl` list, skeletons, `ChPagination`, empty card). Uses `useGetCourseLeaderboard`; `NOT_ENROLLED` shows the error toast and an empty card with an **Enroll** hint.
- `leaderboard/components/leaderboard-row.tsx`: place (🥇🥈🥉 badges for 1–3, `#n` after), `Avatar`, full name (fallback username), email under the name when present (creator view; muted, truncated), points right-aligned. The current learner's row is highlighted; withdrawn rows get `opacity-50` and a **Withdrawn** badge.
- `leaderboard/components/leaderboard-me-row.tsx`: when `me` isn't on the current page, a sticky row at the bottom with the learner's place and points.
- `leaderboard/components/points-legend.tsx`: header `Popover` (**How points work**) rendering `LEADERBOARD_POINTS`.
- `en` / `sr` strings under `learn.leaderboard.*` (title "Leaderboard" / "Rang lista", empty, place, points, you, howPointsWork, each legend line, lessonDoneLocked).

## Native (progress updates only, no leaderboard screen)

Native must send the same progress the gates need, otherwise a mobile-only learner can't complete a topic with a video. `apps/native/src/modules/learn-course/`:

- `hooks/use-lesson-progress.ts`: `useLessonVideoProgress` takes an optional `topicId` and an `onTopicVideoWatched` callback; on `playToEnd` with a topic selected (no lesson) it calls it. New `useSaveTopicProgress(publicId)` next to `useSaveLessonProgress` (mutation + invalidate course progress, same error toast).
- `components/lesson-video-player.tsx` / `learn-video.tsx`: pass `topicId` through for topic videos (course video still gets neither id).
- `components/learn-content.tsx`: pass the selected topic id when no lesson is selected; `handleQuizResponseChange` already invalidates course progress for every quiz, so topic/course quiz saves and **Redo** refresh the derived status and points with no change.
- `components/lesson-status-select.tsx` + `learn-status.tsx`: same `isDoneLocked` as web (Done option disabled with the `lessonDoneLocked` hint) from `lessons[].isGated`.
- `learn-next-step.tsx`: no "Mark as done" step for gated lessons (check it uses `isGated` rather than its own video/quiz test).
- Completed dialog: already driven by the derived course status from the progress query; verify it opens after a topic video end and a topic/course quiz save.
- Add a row to `apps/native/spec/n-task-init.md` pointing at this spec; verify with `pnpm --filter native typecheck` / `lint`.

## Plan

- [x] 1. Spec (this file) + `spec/task-init.md` row
- [x] 2. DB schema: `learner_activity_days`, `topic_progress`, relations, entity types
- [x] 3. User runs `pnpm db:generate --name leaderboard` and applies it
- [x] 4. Contract: `leaderboard/` schemas, types, `LEADERBOARD_POINTS`; progress error codes, topic progress schemas, `isGated`
- [x] 5. Error messages + `errors.progress.*` in `en` / `sr`
- [x] 6. API progress: `deriveCourseStatus` with gates; `syncCourseCompletion` (replaces the repo count); lesson Done gate; topic video endpoint; activity days; quiz save/clear sync for every level
- [x] 7. API module `leaderboard/` (repo, `scoreLeaderboard`, service, controller, routes, openapi) + mount + OpenAPI schema
- [x] 8. `pnpm api-client:generate` + re-export `leaderboard`
- [x] 9. Web: Leaderboard link before Reviews; locked **Done** in the status dropdown; topic video `onEnded`; completed dialog after topic/course gates
- [x] 10. Web: `/learn/[publicId]/leaderboard` page + row, me-row, points legend
- [x] 11. i18n `en` / `sr`
- [x] 12. Native: topic video watched, `useSaveTopicProgress`, locked **Done**, next-step check
- [x] 13. Verify: `pnpm typecheck`, `pnpm lint`, `pnpm build`; update FEATURES.md, the task index and `apps/native/spec/n-task-init.md`
- [x] 14. Manual check in the browser after the migration: gated Done, topic video completion, Redo dropping points, creator vs learner view, withdrawn row

## Implementation notes

- Names differ slightly from the sections above: the derivation is `deriveCourseProgress` (`progress/services/deriveCourseProgress.ts`), scoring is `leaderboard/services/scoreLearner.ts`, and gated lessons come back as `CourseProgress.gatedLessonIds` instead of a per-lesson `isGated` (keeps `LessonProgress`, which is also the PUT response, unchanged).
- The "me" row reuses `LeaderboardRow` in a sticky footer; the points legend is a `Dialog` (`points-legend-dialog.tsx`) because `@repo/ui-web` has no Popover.
- The leaderboard link sits above Reviews in a column in the reader tree header (the header grows from `h-14` to `min-h-14`) and only shows for the creator and enrolled learners.
- Topic quiz saves need no web/native change: `onResponseChange` already refetches course progress for every quiz.

## Resolved Questions

- Blocking: every lesson and topic video must be watched (not the course video) and every quiz (lesson, topic, course) must be passed before the course is done.
- Quiz **Redo** (Clear answers): the quiz's points are removed as if it was never taken, and so are any completion points it unlocked (the lesson drops back to `in_progress`, the topic/course is no longer done). Answering again earns them back from the new score.
- Emails: creator only.
- Withdrawn learners: stay on the list, greyed out.
- Native sends topic-video and gated progress updates (section above); no native leaderboard screen.

## Open Questions

None.
