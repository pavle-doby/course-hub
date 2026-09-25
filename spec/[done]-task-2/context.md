# Task 2 — Context

## Goal
Add an "Edit Course" page at `/courses/[id]/edit`, reusing the existing "Add Course"
editor UI components/hooks from `apps/web/app/courses/add/**` (built in task-1) instead
of duplicating them.

## Key discovery
- `apps/web/app/courses/components/course-card.tsx` already had a dropdown item
  navigating to `/courses/${course.publicId}/edit` (dead link — route didn't exist).
- Backend `GET/PUT /courses/:id` (`useGetCourse`/`useUpdateCourse` in `@repo/api-client`)
  operate on the real course `id`, not `publicId`. `coursesRepository.getCourseByPublicId`
  existed but was unused by any route/controller.
- Fix (added after initial pass, per explicit follow-up request): the URL segment is
  the course's `publicId`, not its real `id`. Added a new backend endpoint
  `GET /v1/courses/public/:publicId` (contract `ParamsPublicIdSchema` +
  `GetCourseByPublicIdRes`, service/controller/route registered *before* `/:id`,
  openapi path) and regenerated `@repo/api-client` → `useGetCourseByPublicId`. The
  route folder was renamed `app/courses/[id]/edit` → `app/courses/[publicId]/edit`;
  the page resolves the real `id` via `useGetCourseByPublicId({ publicId })` first,
  then uses that `id` for `useGetTopics`/`useGetLessons`/all mutations (guarded with
  `enabled: !!id` and an early loading return before any handler is defined, since
  `id` is `string | undefined` until the lookup resolves).
- All add-page building blocks (`CourseTreeNav`, `CourseWorkingArea`, `EntityForm`,
  `MediaInputPlaceholder`, `useCourseTree`, `Selection` type) are generic over
  course/topic/lesson data passed as props — no changes needed to reuse them from a
  new route; imported via relative paths from `add/**` rather than moved/duplicated.
- `CourseEditorHeader` had a hardcoded `t("courses.addCourse")` title — changed to
  accept a `title: string` prop so both add and edit pages can supply their own label.
  Added `courses.editCourse` i18n key (en/sr).

## Differences from the add-page flow
- No `ensureCourseId()` lazy-create step — the course already exists; `id` comes
  straight from the route param and is used directly for all queries/mutations.
- Course data is fetched via `useGetCourse({ id })` and seeded into local `course`
  state via a `useEffect` (add page initializes `course` state directly from create
  mutation responses instead).
- Header title is "Edit Course" instead of "Add Course".

## Relevant existing patterns referenced
- `apps/web/app/courses/add/page.tsx` (state/handlers duplicated with the above
  differences)
- `apps/web/app/courses/add/components/*`, `apps/web/app/courses/add/hooks/use-course-tree.ts`,
  `apps/web/app/courses/add/types.ts` (reused in place, imported via relative paths)
- `apps/web/app/courses/components/course-card.tsx` (existing link target for this route)
- `packages/i18n/src/locales/{en,sr}/courses.ts`
