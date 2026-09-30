# n-task-1: Phase 1, Learner experience

Detailed plan for Phase 1 of [n-task-init.md](n-task-init.md): index tasks **3 (Catalog & course cards)**, **4 (Course reader)**, **5 (Video playback & progress)**, **6 (Learner quizzes)**, **7 (Reviews)** and **8 (Invitations, accept side)**. The progress log at the bottom records what is done.

Web is the reference for behavior. Each section names the web files it ports, so you can compare them side by side.

## Findings that shape the plan

- **Orval generates plain `useQuery` hooks only** (no `useInfiniteQuery`). The generated fetchers (`getPublicCourses`, `getCourses`, `getEnrolledCourses`, `getCourseReviews`) and query-key builders are exported, so infinite lists use `useInfiniteQuery` from `@tanstack/react-query` over those fetchers. No hand-written HTTP, and `pnpm api-client:generate` is not needed.
- API pagination is **0-based** (`page` in the request, `pagination: { page, limit, total }` in the response).
- **Signed-out users only see the auth stack** (n-task-0 decision). So the "visitor" views on web (public catalog without login, public course page, "log in to enroll") become **signed-in but not enrolled** views on native. The one exception is the invite link (task 8), which must open while signed out.
- NativeWind v4 on native has **no `bg-gradient-*`** and no `[&_[data-slot=…]]` selectors. Course cards without a thumbnail use a solid color picked from the same hash as web (`courseCardGradient`). Progress colors return a `{ text, indicator }` pair, and the indicator goes to `Progress`'s `indicatorClassName`.
- `expo-image`'s `Image` has no `className` without `cssInterop`, so images use `style`.
- Web's reader is a resizable sidebar plus a working area. On a phone, native uses **one scroll screen, a bottom bar (Previous / Contents / Next), and the tree in a sheet** (RN `Modal`, `presentationStyle="pageSheet"`). This is the same layout web uses on mobile (`LearnBottomNav` + off-canvas sidebar).
- Web keeps the tree selection in `?topic=` / `?lesson=` (`useSelectionSearchParam`). Expo Router has the same search params (`useLocalSearchParams` + `router.setParams`), so shared links and notification deep links (`/learn/<publicId>?lesson=<id>`) work unchanged.
- Web-only APIs and what replaces them: `canvas-confetti` → an app confetti component on Reanimated; `navigator.vibrate` → `expo-haptics`; `<video>` → `expo-video`; `<a target=_blank>` for documents → `expo-web-browser` `openBrowserAsync`; ui-web `Questionnaire` → an app stepper.

## Shared pieces (built in task 3, used by later tasks)

- `src/hooks/use-debounce.ts`: copy of the web hook.
- `src/hooks/use-infinite-list.ts`: `useInfiniteQuery` wrapper for `{ data, pagination }` responses. Key is `[...generatedKey, "infinite"]`, so it never shares a cache entry with a plain `useQuery` of the same endpoint. Invalidating the generated key prefix still refetches it. Returns flat `items`, `fetchNextPage`, `hasNextPage`, `isFetchingNextPage`, `refetch`, `isRefetching`, `isPending`, `error`.
- `src/utils/course-card-color.ts`, `src/utils/get-progress-color.ts`: native versions of the web utils.
- `src/components/course/`: `course-card.tsx`, `course-card-skeleton.tsx`, `course-stats.tsx`, `course-list.tsx` (FlatList with search header, skeletons, empty text, infinite scroll, pull-to-refresh, error toast).
- `src/utils/toast-error.ts`: `showToastError` for the `@repo/shared` error hooks (`toast.error(title, { description })`).

## Task 3: Catalog & course cards

Web: `app/page.tsx`, `app/learn/{explore,enrolled}/page.tsx`, `components/course-card*.tsx`, `components/course-stats.tsx`, `hooks/use-{debounce,pagination}.ts`.

- **Home tab** (`(tabs)/index.tsx`): `getPublicCourses({ query, page, limit })`, title `learn.title`, search `learn.searchPlaceholder`, empty `learn.empty`.
- **Learn tab** (`(tabs)/learn.tsx`): `Tabs` segmented control for **Explore** / **Enrolled** (web: two nav entries, `/learn` redirects to Explore). Explore: `getCourses({ excludeEnrolled: true, showAllCreators: true, status: "published" })`, empty `learn.explore.empty`. Enrolled: `getEnrolledCourses`, card shows `progressPercent`, empty `learn.enrolled.empty`. Each segment keeps its own search text.
- **Course card**: thumbnail (or colored block with `BookOpen` icon), creator avatar + initials fallback, name (1 line), progress bar + percent (enrolled), description (3 lines), stats row (enrolled count in compact notation, rating star + average + count, public / private). Tap → `/learn/<publicId>`. Optional `showStatus` badge + `actions` slot, for n-task-13.
- **Page size**: 10 per page, loaded on scroll (the index says infinite scroll instead of numbered pages). Search is debounced 300 ms and restarts from page 0.
- Pull-to-refresh on every list.

## Task 4: Course reader

Web: `app/learn/[publicId]/page.tsx`, `components/learn-{header,tree-nav,working-area,bottom-nav,course-detail-skeleton}.tsx`, `progress-status-icon.tsx`, `hooks/use-course-tree.ts`, `hooks/use-selection-search-param.ts`, `components/ch-alert-dialog.tsx`.

- Route `src/app/(app)/learn/[publicId]/index.tsx`, registered in the `(app)` stack.
- Data (same as web): `useGetPublicCourseByPublicId`, `useGetEnrollmentStatus`; public topics/lessons when not enrolled, enrolled topics/lessons when enrolled; `useGetCourseProgress`, `useGetMyCourseReview` when enrolled. Not found / not published → `learn.detail.notFound`.
- `src/modules/learn-course/hooks/use-course-tree.ts` (copy of web: `useCourseTree`, `useAdjacentSelection`, `Selection`), `src/modules/learn-course/hooks/use-selection-param.ts` (`?topic` / `?lesson` via `router.setParams`).
- Header (`learn-header.tsx`): back, title, progress bar + percent when enrolled; Enroll (not enrolled) or Review + Withdraw (enrolled). Withdraw asks for confirmation (`ChAlertDialog` port on ui-native `AlertDialog`) and goes back to the course overview.
- Content (`learn-content.tsx`): course thumbnail on the overview, name, rating (`StarRating`) on the overview, video slot (task 5), documents (tap → `openBrowserAsync(publicUrl)`, image docs show a thumbnail), description or `learn.detail.noDescription`, quiz slot (task 6).
- Tree sheet (`learn-tree-sheet.tsx`): course row, topics (collapsible, open by default), lessons, status icons when enrolled, a Reviews link at the top, placeholder skeleton rows while the enrolled tree loads. Topic/lesson rows are disabled when not enrolled. Selecting closes the sheet.
- Bottom bar (`learn-bottom-bar.tsx`): Previous / Contents / Next, disabled when not enrolled or at the ends.
- Resume: with no `topic` / `lesson` param, jump once to `progress.lastLessonId` unless the course is done (web `restoreLastLesson`).
- A topic/lesson param only applies once enrolled and when it exists in the tree; otherwise show the overview.
- Enroll → refetch enrollment status. The learner push prompt after enrolling (`NotificationPrompt`) moves to n-task-9, because native push doesn't exist yet.
- Loading skeleton (`learn-reader-skeleton.tsx`).

## Task 5: Video playback & progress

Web: `learn-working-area.tsx` (video + status), `hooks/use-lesson-progress.ts`, `lesson-status-select.tsx`, `course-completed-dialog.tsx`, `utils/consts.ts`, `utils/get-video-refetch-interval.ts`.

- `npx expo install expo-video expo-haptics` (+ `expo-video` config plugin). Needs a new dev build.
- `useGetVideoByParent` (enrolled; parent = selected course/topic/lesson) / `useGetPublicVideoByParent` (not enrolled; course video only), polling while `uploading` / `processing`. Processing and error alerts (`learn.detail.videoProcessing` / `videoUnavailable`).
- `src/modules/learn-course/hooks/use-lesson-progress.ts`: `useSaveLessonProgress` (writes the saved lesson row into the progress cache, invalidates on status / `videoWatched`) and `useLessonVideoProgress` on an `expo-video` player: seek to `progressSeconds` once loaded (if < duration − 1), `in_progress` on first play when `todo`, save the position every 10 s, on pause and when leaving the lesson, `videoWatched: true` + position 0 on `playToEnd`.
- Status: `LessonStatusSelect` (ui-native `DropdownMenu` radio items), read-only topic/course status badge, and a "next step" button (`NEXT_LESSON_STATUS`) pinned above the bottom bar. Lessons with a ready video or a quiz get no "Mark as done" step (web rule).
- `ProgressStatusIcon` with the web icons / colors, also used in the tree.
- Completion: when `progress.status` turns `done` during this visit → confetti burst + `CourseCompletedDialog` (New course → Learn/Explore; Review when there's no review yet, otherwise Thank you). While it's open, soft bursts repeat on alternating sides, like the web fireworks. Tapping empty space on a finished course bursts confetti there.
- `src/components/confetti.tsx`: a small Reanimated particle burst (absolute overlay, `pointerEvents="none"`), exposed via a `useConfetti()` context from the reader. No new dependency.

## Task 6: Learner quizzes

Web: `components/quiz/*`.

- `learn-quiz.tsx`: `useGetPublicQuiz(parent)`; not enrolled → question count + `learn.quiz.enrollHint`; enrolled → `useGetMyQuizResponse` → result or questionnaire.
- `quiz-questionnaire.tsx` on **`@repo/ui-native/components/questionnaire`** (native port of the ui-web `Questionnaire`, same parts). Differences from web: the Root takes `items` with `{ name, required, multiple }` (order + validation source) and `onSubmit(answers: Record<name, string[]>)` instead of a form event, so no `FormData` parsing; `onChange` still maps to `onStart` (lesson → `in_progress`).
- Submit → `useSaveQuizResponse`, cache the response, invalidate course progress. A perfect score gives confetti + a success haptic; otherwise a light haptic.
- `quiz-result.tsx` / `quiz-result-item.tsx`: score (or `noScore`), 🎉 button re-bursts on a perfect score, per-question answer vs. correct answers, Clear answers with confirmation (`useDeleteQuizResponse`).

## Task 7: Reviews

Web: `review-dialog.tsx`, `review-stars.tsx`, `reviews/page.tsx`, `reviews/components/review-reply-form.tsx`, `components/star-rating.tsx`.

- `review-stars.tsx`: 1–5 star picker (read-only mode for lists).
- `review-dialog.tsx`: ui-native `Dialog`, `SaveCourseReviewBodySchema` + react-hook-form (`Controller`), prefilled from `useGetMyCourseReview`, invalidates my review, course, and reviews list.
- Opened from the header Review button and from the completion dialog.
- Route `(app)/learn/[publicId]/reviews.tsx`: course rating summary, infinite list of reviews (`getCourseReviews`, 10 per page), author avatar/name/date/stars/comment, creator reply shown inline; the creator can reply / edit a reply (`review-reply-form.tsx`); an enrolled learner sees a "Write/Edit review" action.

## Task 8: Invitations (accept side)

Web: `app/invite/[token]/page.tsx`, the invite handling in `auth/[mode]/components/{login,signup}-form.tsx`.

- Route `src/app/invite/[token].tsx` **outside** both guards, so it opens signed in or signed out. It is registered in the root stack as a screen that is always available.
- `useGetInvitationInfo({ token })`: invalid → invalid card + Go home. Valid + signed in → Accept (`useAcceptInvitation`) → toast → `router.replace("/learn/<publicId>")`. Signed out → Sign up (`/signup?token=…&email=…`) / Log in (`/login?token=…`).
- Login / signup forms read `token` (and `email` for signup, prefilled + read-only if web does so). After auth, they accept the invite the way web does, then go to the course.
- Deep links: scheme `coursehub://invite/<token>` works through Expo Router. Universal links for `https://<web host>/invite/<token>` need `associatedDomains` / intent filters and the web host's `apple-app-site-association` / `assetlinks.json`. That is recorded here and done in n-task-20 (EAS & ship).

## i18n

Reuse the existing `learn.*`, `courses.card.*`, `invite.*` and `notifications.*` keys. New keys (for example `learn.tabs.explore`) are added in `en` and `sr`.

## Verification (each task)

- `apps/native`: `npx tsc --noEmit`, `npx expo lint`; `npx expo export --platform ios` as a bundle check once new native deps land (tasks 5 +).
- `pnpm typecheck` if a shared package changed.
- Manual (user): dev build on a simulator / emulator. New native modules (`expo-video`, `expo-haptics`) need `npx expo prebuild --clean` + `pnpm ios` / `pnpm android`.

## Progress log

### Task 3: Catalog & course cards (done, pending manual check)

- [x] `hooks/use-debounce.ts`, `hooks/use-infinite-list.ts` (`useInfiniteQuery` over Orval fetchers, key suffix `"infinite"`), `utils/{course-card-color,get-progress-color,toast-error,consts}.ts`.
- [x] `components/course/{course-card,course-card-skeleton,course-stats,course-list}.tsx`, `components/search-input.tsx`.
- [x] Home tab: public catalog. Learn tab: Explore / Enrolled segmented `Tabs`; both lists stay mounted so each keeps its search.
- Page size 10 (`COURSE_PAGE_LIMIT`), next page on scroll, pull-to-refresh.

### Task 4: Course reader (done, pending manual check)

- [x] Route `(app)/learn/[publicId]/index.tsx`; data in `modules/learn-course/hooks/use-learn-course.ts`; `modules/learn-course/hooks/use-course-tree.ts` (web copy), `modules/learn-course/hooks/use-selection-param.ts` (`?topic` / `?lesson` via `router.setParams`).
- [x] `modules/learn-course/components/`: `learn-header` (enroll / withdraw with confirmation, progress bar), `learn-content` (thumbnail, title, rating, documents, description), `learn-documents` (`openBrowserAsync`), `learn-tree-sheet` (page-sheet `Modal`, collapsible topics, status icons, locked when not enrolled), `learn-bottom-bar`, `learn-reader-skeleton`, `progress-status-icon`. Shared: `modules/learn-course/components/ch-alert-dialog.tsx`, `components/star-rating.tsx`.
- [x] Resume `lastLessonId` once; a param selection applies only when enrolled and in the tree; back falls back to Home when the reader was opened from a deep link.
- [x] Enroll / withdraw also invalidate the enrolled + explore lists (the tabs stay mounted, so nothing refetches on remount as it does on web).
- New i18n key: `learn.detail.closeContents` (en + sr).
- Deferred on purpose: the header Review button shows only once `onReview` is passed (task 7); the Reviews link in the tree sheet is added with the reviews screen (task 7); the push prompt after enrolling moves to n-task-9.
- Verified: `npx tsc --noEmit`, eslint and prettier are clean, and `npx expo export --platform ios` bundles.
- Lesson loading skeleton (web + native): the content area shows `LearnWorkingAreaSkeleton` (web) / `LearnContentSkeleton` (native) while enrollment, the enrolled tree, or progress loads, and while the resume jump hasn't reached the URL/params yet, so the course overview no longer flashes first. The resume is now derived (`resumeLessonId`, stopped by a `hasNavigated` flag set on any selection) instead of a ref + effect. Documents (both) and the video slot (web) show a placeholder while they load.
- Fix after the first run: "No QueryClient set" on Home. `@repo/api-client` resolves its own nested `@tanstack/react-query` (5.100) while the app resolved the root copy (5.103), so `useInfiniteQuery` didn't see `ApiClientProvider`'s client. `@repo/api-client` now re-exports `useInfiniteQuery` (+ types) and the app never imports `@tanstack/react-query` directly.

### Task 5: Video playback & progress (done, pending manual check)

- [x] Status dropdown: `modules/learn-course/hooks/use-lesson-progress.ts` (`useSaveLessonProgress`, web port: writes the saved row into the progress cache, refetches on a status change), `modules/learn-course/components/lesson-status-select.tsx` (ui-native `DropdownMenu` radio items with status icons), `modules/learn-course/components/learn-status.tsx` under the title: the dropdown for a lesson (skeleton while saving), a read-only badge for a topic or the course. Shown only when enrolled; tree icons and the header progress bar update through the refetched progress.
- [x] Completion: `modules/learn-course/components/course-completed-dialog.tsx` opens when `progress.status` turns `done` during this visit (previous-status state updated during render, no effect; opening a finished course doesn't trigger it). Opening fires the big bottom-center burst, then soft fireworks alternate sides every 1.7 s while it's open (`FIREWORK_INTERVAL` / `FIREWORK_SIDES` from web). Buttons: **Thank you** (close) + **New course** (→ Learn tab). Deviation from web: always "Thank you"; web swaps it for **Review** when the learner has no review yet — add that with task 7. On a finished course, taps on non-interactive content burst confetti there (a disabled-unless-done `Pressable` around the content; buttons and inputs keep their own taps). Confetti got `gravity` + `scalar` options for the fireworks.
- [x] Video: `expo-video` + `expo-haptics` installed (`expo-video` config plugin in `app.json`; **needs a new dev build**). `modules/learn-course/hooks/use-selection-video.ts` (enrolled → selection's video, otherwise the public course video; polls while uploading / processing via `modules/learn-course/utils/get-video-refetch-interval.ts`), `modules/learn-course/components/learn-video.tsx` (skeleton / player / processing and unavailable alerts), `modules/learn-course/components/lesson-video-player.tsx` (`useVideoPlayer` + `VideoView`, native controls, fullscreen, keyed by video id).
- [x] `useLessonVideoProgress(player, …)` in `modules/learn-course/hooks/use-lesson-progress.ts` on `expo`'s `useEventListener`: `sourceLoad` seeks to `progressSeconds` (if < duration − 1; `seekBy` because the React Compiler rejects assigning `currentTime` on a hook argument), `playingChange` → `in_progress` when `todo` / flush the position on pause (skipped within 1 s of the end), `timeUpdate` every 1 s → save at most every 10 s, `playToEnd` → `videoWatched: true` + position 0, flush when the lesson is left.
- [x] Next step: `modules/learn-course/components/learn-next-step.tsx` pinned between the scroll view and the bottom bar (enrolled + lesson only), `NEXT_LESSON_STATUS` rule from web (no "Mark as done" with a ready video or a quiz). Its video / quiz queries share the content's cache. Deviation: it keeps its own saving state, so the status dropdown doesn't turn into a skeleton while the button saves (web shares one flag).
- [x] Haptics: quiz submit → success notification on a perfect score, otherwise a light impact (web `vibrate`).
- Verified: `npx tsc --noEmit`, eslint, prettier, `npx expo export --platform ios`.

### Task 6: Learner quizzes (done, pending manual check)

- [x] `modules/learn-course/components/quiz/`: `learn-quiz` (quiz card; visitor → question count + enroll hint; enrolled → result or questionnaire; save / clear update the response cache and refetch progress), `quiz-questionnaire` (on `@repo/ui-native/components/questionnaire`; maps its `Record<name, string[]>` to `QuizAnswers`), `quiz-questionnaire-skeleton`, `quiz-result` (score, breakdown, Redo with confirmation), `quiz-result-item`, `public-quiz`.
- [x] Shown at the end of the course / topic / lesson content, keyed by parent. The first answer on a `todo` lesson marks it `in_progress`, and the refetched progress picks up the status the server derives from a quiz result.
- [x] Reader `ScrollView`: `keyboardShouldPersistTaps="handled"` + `automaticallyAdjustKeyboardInsets` for text answers.
- Confetti (no new dependency): `components/confetti/` (`ConfettiProvider` in the root navigator + `useConfetti()`; Reanimated particles with drag + gravity, canvas-confetti palette and option names; iOS `FullWindowOverlay` so it draws above dialogs; skipped with Reduce Motion) and `modules/learn-course/hooks/use-celebrate.ts` (web `celebrate` / `celebrateFrom`, mobile variants). A perfect score bursts from the bottom center; the 🎉 next to the score bursts from where it's tapped. Task 5 reuses it for the completion dialog. Left for task 5: the haptic (web `vibrate`). The progress text is the component's English default ("Question n of total"), the same as web.

### Task 7: Reviews (done, pending manual check)

- [x] `modules/reviews/components/`: `review-stars` (1–5 picker / read-only row), `review-dialog` (ui-native `Dialog`, `SaveCourseReviewBodySchema` + react-hook-form, prefilled from `useGetMyCourseReview`, invalidates my review, the course and the reviews list, success toast), `review-item`, `review-reply-form` (creator: write / edit / delete a reply), `reviews-header`, `reviews-empty`.
- [x] Route `(app)/learn/[publicId]/reviews.tsx`: rating summary in the header, infinite list over `getCourseReviews` (`REVIEW_PAGE_LIMIT` 10) with pull-to-refresh, creator replies inline, empty card with "Write the first review" for enrolled learners. Addition over web: a header Review button for enrolled learners, so they can edit an existing review from this screen too.
- [x] Reader: header Review button (enrolled), Reviews link at the top of the contents sheet, completion dialog swaps "Thank you" for **Review** while the learner has no review (`hasNoReview` from `useLearnCourse`), like web.
- Shared: `components/form/form-textarea.tsx` (`FormTextarea`, `hideLabel` for the reply field since NativeWind has no `sr-only` on native), `modules/reviews/hooks/use-keyboard-height.ts`. The centered dialog gets a bottom margin of the keyboard height so the comment field and Save stay above the keyboard.
- No new i18n keys (all `learn.reviews.*` exist).
- Verified: `npx tsc --noEmit`, eslint, prettier, `npx expo export --platform ios`.
