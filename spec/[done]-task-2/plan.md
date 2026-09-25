# Task 2 — Plan

## Done ✅
- [x] `CourseEditorHeader` — added `title: string` prop (was hardcoded to
      `t("courses.addCourse")`); updated add page's call site to pass
      `t("courses.addCourse")` explicitly.
- [x] `packages/i18n/src/locales/en/courses.ts` / `sr/courses.ts` — added
      `editCourse` key ("Edit Course" / "Izmeni kurs").
- [x] `apps/web/app/courses/[id]/edit/page.tsx` — new edit page:
      - Reads `id` from the route param via `useParams`.
      - Fetches course via `useGetCourse({ id })`, topics/lessons via
        `useGetTopics`/`useGetLessons({ courseId: id })`, builds tree via the
        existing `useCourseTree` hook (imported from `../../add/hooks/use-course-tree`).
      - Reuses `CourseEditorHeader`, `CourseTreeNav`, `CourseWorkingArea` and the
        `EntityFormHandle`/`EntityFormValues`/`Selection` types from `add/**` as-is
        (no duplication of components, only of the page-level state/handlers, which
        differ from `add/page.tsx` by not needing lazy course creation).
      - Save/publish/add/delete topic & lesson handlers mirror `add/page.tsx` minus
        `ensureCourseId()` (course id is always known here).
      - `handleBackOrCancel` navigates to `/courses`, matching add page behavior.
- [x] `get_errors` on the new page + edited header/add-page files — clean.

## Done ✅ (follow-up: publicId → id resolution)
- [x] `packages/contract/src/courses/schemas.ts` — `ParamsPublicIdSchema`.
- [x] `packages/contract/src/courses/types.ts` — `GetCourseByPublicIdRes`.
- [x] `apps/api/src/modules/courses/{services,controllers,routes,openapi}/*` —
      `GET /courses/public/:publicId` (registered before `/:id` to avoid segment-count
      ambiguity — not actually ambiguous since paths differ in segment count, but kept
      the more specific route first for clarity), reusing the previously-unused
      `coursesRepository.getCourseByPublicId`.
- [x] Regenerated OpenAPI + api-client (`pnpm --filter api generate:openapi &&
      pnpm --filter @repo/api-client generate:api`) — confirmed `useGetCourseByPublicId`
      exists and is exported from the `@repo/api-client` barrel.
- [x] Renamed route folder `app/courses/[id]/edit` → `app/courses/[publicId]/edit`.
- [x] Page now calls `useGetCourseByPublicId({ publicId })` to resolve the real course
      `id`, then uses it for `useGetTopics`/`useGetLessons` (both `enabled: !!id`) and
      all course/topic/lesson mutations. Added an early loading-state return (after all
      hooks, before any handler definitions) so `id` narrows to `string` for the rest
      of the render.
- [x] `course-card.tsx` needed no change — it already linked to `course.publicId`,
      which now resolves correctly.
- [x] `get_errors` clean on the updated page + all new/edited backend/contract files.

## Remaining ⏳
- [ ] Manual/browser verification against a running API + DB (not exercised in this
      session — static analysis + `get_errors` only, per user's choice to skip running
      `pnpm --filter web check-types` in-session).
- [ ] Decide separately (if/when asked) whether `course-card.tsx` should link with
      `course.id` instead of `course.publicId`, or whether a publicId-based backend
      route should be added.

## Done ✅ (follow-up round 2: editor UX improvements)
- [x] Moved add-page-only building blocks that are actually shared between add/edit
      into `apps/web/app/courses/components/*` and `apps/web/app/courses/hooks/use-course-tree.ts`
      and `apps/web/app/courses/types.ts`; deleted `add/components`, `add/hooks`,
      `add/types.ts`; updated imports in both `add/page.tsx` and `[publicId]/edit/page.tsx`.
- [x] Fixed edit page not pre-populating: local `course` state synced via `useEffect`
      raced with `EntityForm`'s mount-only `defaultValues`, so the form could mount with
      empty defaults for one render before the effect fired (and never re-sync after).
      Replaced with `displayedCourse = course ?? courseData ?? { name: "", description: "" }`
      computed directly during render — no effect, no race.
- [x] `CourseEditorHeader` — 3-column grid layout: back+title (left), Auto Save switch
      (center), cancel/save/publish (right). Added `isSaving?: boolean` prop.
- [x] Save button shows disabled + "Saving…" (new `courses.editor.saving` i18n key,
      en/sr) while an autosave or manual flush is in flight.
- [x] `EntityForm` — added `onSavingChange?: (saving: boolean) => void`, called around
      the existing `onSave` call inside `save()`; threaded through
      `CourseWorkingArea` → both `add/page.tsx` and `edit/page.tsx` (new `isSaving` state).
- [x] Autosave semantics changed from debounced `watch()` + `setTimeout` to
      onBlur-triggered: each input's `onBlur` checks `formState.dirtyFields[field]` and
      calls `save()` only if that field changed and `autoSave` is on (fires when a
      field loses focus after being edited, not on every keystroke).
- [x] Reviewed forms pattern vs `login-form.tsx`/`signup-form.tsx` — `EntityForm`
      already follows the same `useForm` + `zodResolver` + `useZodLocale` shape; no
      further changes made there (the `useErrorHandlingForm` root/field-error UI isn't
      a fit here since `onSave` errors are handled by the parent pages via
      `useErrorHandlingAction` + toast, matching the existing add/edit page convention).
- [x] `get_errors` clean on all touched/created files.
