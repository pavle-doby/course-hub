# Task 1 — Plan

## Done ✅

### Bugfix found while resuming
- [x] `packages/api-client/src/index.ts` was missing `export * from "./generated/topics/topics"`
      — the topics hooks existed on disk from the previous session but were never
      re-exported from the package barrel, so `useGetTopics`/`useCreateTopic`/etc.
      were unusable from `apps/web`. Fixed.

### Backend — Topics module (full CRUD, mirrors `lessons` module)
- [x] `packages/contract/src/topics/schemas.ts` — `TopicSchema`, `TopicGetAllQuerySchema`,
      `TopicPostQuerySchema`, `TopicPutQuerySchema`
- [x] `packages/contract/src/topics/types.ts` — `Topic`, `GetAllTopicsReq/Res`,
      `CreateTopicReq/Res`, `UpdateTopicReq/Res`, `DeleteTopicRes`
- [x] `packages/contract/src/topics/errors.ts` — `ErrorCodeTopic.NOT_FOUND`
- [x] `packages/contract/src/topics/index.ts` — barrel
- [x] `packages/contract/src/index.ts` — export `./topics`
- [x] `apps/api/src/modules/topics/repository/topicsRepository.ts`
- [x] `apps/api/src/modules/topics/services/topicsService.ts`
- [x] `apps/api/src/modules/topics/controllers/topicsController.ts`
- [x] `apps/api/src/modules/topics/routes/topicsRoutes.ts`
- [x] `apps/api/src/modules/topics/openapi/topics.ts`
- [x] `apps/api/src/openapi/schemas.ts` — registered `TopicSchema`/`PaginatedTopicsSchema`
- [x] `apps/api/src/openapi/spec.ts` — side-effect import of topics openapi
- [x] `apps/api/src/routes/apiRoutes.ts` — `/v1/topics` mounted with `handleAuth`
- [x] Regenerated OpenAPI spec + orval client (`pnpm --filter api generate:openapi &&
      pnpm --filter @repo/api-client generate:api`) — confirmed
      `packages/api-client/src/generated/topics/topics.ts` now has `useGetTopics`,
      `useCreateTopic`, `useUpdateTopic`, `useDeleteTopic`. No TS errors in any new/edited
      backend files (checked with get_errors).

### UI package
- [x] Added `Switch` (`packages/ui-web/src/components/switch.tsx`) and `Textarea`
      (`packages/ui-web/src/components/textarea.tsx`) via
      `pnpx shadcn@latest add switch textarea --cwd packages/ui-web --yes`

### Routing restructure
- [x] `git mv apps/web/app/courses apps/web/app/(courses)/courses` — moved
      `layout.tsx`, `page.tsx`, `components/course-card.tsx`,
      `components/course-card-skeleton.tsx` into the `(courses)` route group.
      URLs unaffected (`/courses` still resolves). This frees up
      `apps/web/app/courses/add/**` to exist as a sibling route tree with its own
      chrome (no `NavigationLayoutProvider`).

### i18n
- [x] Added `courses.editor.*` key group to `packages/i18n/src/locales/{en,sr}/courses.ts`
      (back, autoSave, cancel, save, publish, addNewTopic, addNewLesson, deleteTopic,
      deleteLesson, nameLabel, descriptionLabel, mediaLabel, mediaPlaceholder,
      previous, next, untitledCourse, newTopicName, newLessonName, nameRequired,
      savedToast, publishedToast).

### Frontend — `apps/web/app/courses/add/`
- [x] `types.ts` — shared `Selection` union type.
- [x] `hooks/use-course-tree.ts` — groups/sorts topics+lessons by `position`.
- [x] `components/media-input-placeholder.tsx` — bordered-box placeholder, no upload wiring.
- [x] `components/entity-form.tsx` — reusable `forwardRef<EntityFormHandle>` form
      (name/description/media placeholder), RHF + zodResolver, 800ms debounced
      autosave when `autoSave && isDirty`, `flush()` exposed via `useImperativeHandle`.
      Schema prop is intentionally `z.ZodTypeAny` (course/topic/lesson `PutQuerySchema`
      variants, each `.pick({name,description}).required({name:true})`), so the
      zodResolver call needs a couple of pragmatic `as`/`any` casts — RHF's resolver
      generics don't reconcile cleanly across a shared schema prop; see inline comment.
- [x] `components/course-editor-header.tsx` — back/Cancel/Save/Publish + Auto Save switch.
- [x] `components/course-tree-nav.tsx` — `Sidebar collapsible="none"`, course root item,
      `Collapsible` topics w/ `SidebarMenuSub` lessons, `SidebarMenuAction` delete on
      topics, custom hover-delete button on lesson sub-items, footer "Add New Topic".
- [x] `components/course-working-area.tsx` — Previous/Next lesson nav, renders
      `EntityForm` per selection, Add Lesson/Add Topic action row below.
- [x] `page.tsx` — owns `courseId`/`course`/`selection`/`autoSave` state, topics+lessons
      queries, all create/update/delete mutation handlers, `ensureCourseId()`,
      `handleSave`/`handlePublish`/`handleBack`/`handleCancel`, wraps everything in its
      own `SidebarProvider` (no `NavigationLayoutProvider` — confirmed by route-group
      restructure above).
- [x] "Add Course" button on `apps/web/app/(courses)/courses/page.tsx` already did
      `router.push("/courses/add")` — no change needed.

### Verification
- [x] `get_errors` on all new/edited files under `apps/web/app/courses/add/**` — clean.
- [x] `pnpm --filter web typecheck` — passes (only 3 pre-existing, unrelated errors
      remain: `proxy.ts` unused `@ts-expect-error`, `api-client-provider.tsx` missing
      React types resolution, `useErrorHandlingForm.ts` i18next key-union strictness —
      none touched by this task, confirmed present before these changes too).
- [x] `pnpm --filter web lint` — 0 errors, 1 pre-expected `no-explicit-any` warning in
      `entity-form.tsx` (the resolver cast).
- [x] Added `@tanstack/react-query` as a direct dep of `apps/web/package.json` (was
      only transitively available via `@repo/api-client`; needed for `useQueryClient`
      used to invalidate topics/lessons queries after mutations). Ran `pnpm install`.

## Remaining ⏳
- [ ] Manual browser check: confirm `/courses/add` renders without the global
      sidebar/mobile header, and walk through add-topic/add-lesson/autosave/publish
      flows end-to-end against a running API + DB (not done — no dev server/DB
      exercised in this session, only static analysis).

## Explicitly out of scope (not requested / pre-existing gaps, do not fix unless asked)
- `CourseCard` links to `/courses/${course.publicId}/edit` — that edit-by-publicId
  route does not exist yet and is unrelated to this task (no `GET /courses` by
  `publicId` route wired either, only `coursesRepository.getCourseByPublicId` exists
  unused). Do not build this unless separately requested.
- `courses/page.tsx` `handleDelete` doesn't invalidate the courses list query after
  delete (pre-existing, unrelated bug) — not in scope.
- `turbo.json` `generate:api`/`generate:openapi` have no `dependsOn` between them, so
  `pnpm api-client:generate` (which runs both via turbo) is racy — worked around by
  running `pnpm --filter api generate:openapi && pnpm --filter @repo/api-client
  generate:api` sequentially instead. Not fixing turbo.json unless asked.
