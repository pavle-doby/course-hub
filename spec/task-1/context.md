# Task 1 — Context

## Goal
Implement the "Add Course" page in `apps/web` (course builder/editor UI):
- Header: back button, "Add Course" label, Auto Save switch, Cancel/Save/Publish buttons.
- Left navigation: course tree (course > topics > lessons).
- Working area: Previous/Next lesson nav, a form for the selected item (course/topic/lesson)
  with Name, Media (placeholder), Description, "Add New Lesson", "Add New Topic" buttons.
- Header and left nav should follow the visual/structural patterns of the existing app
  header (`apps/web/components/mobile-header.tsx`) and side nav
  (`apps/web/components/side-nav-menu.tsx`), but this editor is a full-screen/immersive
  view — it must NOT be wrapped by the global `NavigationLayoutProvider` chrome.

## Key discovery
There was no backend support for `topics` (DB table existed, but no API module, no
contract schemas, no generated api-client hooks). Lessons need a real `topicId`, so the
user was asked and confirmed: **build the full Topics backend** (not frontend-only/local
state).

## Decisions made
- Added a full `topics` module to `apps/api` mirroring the existing `lessons` module
  exactly (controller/service/repository/routes/openapi), plus `@repo/contract` schemas
  (`packages/contract/src/topics/*`), and regenerated `packages/api-client` so
  `useGetTopics`, `useCreateTopic`, `useUpdateTopic`, `useDeleteTopic` exist.
- Restructured `apps/web/app/courses` → `apps/web/app/(courses)/courses` (Next.js route
  group) so that `apps/web/app/courses/add/**` can be a sibling route that does NOT
  inherit the `(courses)/courses/layout.tsx` (`NavigationLayoutProvider`). This is the
  documented Next.js pattern for "opting a route out of a parent layout".
- Added `Switch` and `Textarea` to `@repo/ui-web` via the shadcn CLI (were missing).
- Course/Topic/Lesson edit forms will use `react-hook-form` + `zodResolver`, with the
  zod schema derived via `.pick({ name: true, description: true })` from the existing
  `CoursePutQuerySchema` / `TopicPutQuerySchema` / `LessonPutQuerySchema` (all exported
  from `@repo/contract`), per `apps/web` forms convention.
- Autosave design: each entity form is a `forwardRef` component exposing
  `flush(): Promise<void>` via `useImperativeHandle`. Debounced (800ms) autosave fires
  only when `autoSave` is on and the RHF form `isDirty`. The header "Save" button calls
  `flush()` on the currently mounted form directly (imperative ref), regardless of the
  Auto Save switch state. "Cancel" and "Back" are equivalent (both just navigate to
  `/courses` — nothing needs to be explicitly discarded since topics/lessons are
  persisted immediately on creation, and unsaved field edits are simply not flushed).
- Topics/Lessons are created immediately (eagerly persisted) when "Add New Topic" /
  "Add New Lesson" is clicked, with default placeholder names ("New Topic"/"New Lesson"),
  then the user edits name/description in the working-area form like any other item.
  This avoids a separate "draft vs persisted" state machine.
- Course itself is lazily created: if the user clicks "Add New Topic" (or Save) before a
  course exists yet, `ensureCourseId()` creates the course first (falls back to a
  default name if the name field is empty), then proceeds.
- Use `useErrorHandlingAction({ t, showToastError: toast.error })` from `@repo/shared`
  for mutation error toasts (existing repo pattern for standalone, non-form actions).

## Relevant existing patterns referenced
- `apps/web/components/mobile-header.tsx`, `apps/web/components/side-nav-menu.tsx`,
  `apps/web/components/navigation-layout-provider.tsx`
- `apps/web/app/(courses)/courses/page.tsx` (formerly `apps/web/app/courses/page.tsx`),
  `.../components/course-card.tsx`
- `apps/api/src/modules/lessons/**` (template copied for the new `topics` module)
- `apps/api/src/modules/courses/**` (template for course create/update ownership checks)
- `packages/contract/src/lessons/**`, `packages/contract/src/courses/**`
- `packages/ui-web/src/components/sidebar.tsx` — `SidebarMenuAction` (hover delete
  button), `Collapsible`/`SidebarMenuSub` (topic → lessons nesting)
- `packages/ui-web/src/components/field.tsx` — `Field`, `FieldLabel`, `FieldError` etc.
- `packages/shared/src/hooks/errors/useErrorHandlingAction.ts`
- `apps/web/hooks/use-debounce.ts` (not used for the editor in the end — RHF-based
  debounce/imperative flush was used instead)
- `packages/i18n/src/locales/{en,sr}/courses.ts` — translation keys live here as plain
  TS objects (`courses.editor.*` namespace to be added)
