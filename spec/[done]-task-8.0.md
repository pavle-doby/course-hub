# Task 8.0: AI Foundation (Shared Course Tools)

Scope: one shared layer of typed "course tools" that both AI features call: the MCP server (`spec/[done]-task-8.1.md`) and the course-edit chat (`spec/[todo]-task-8.2.md`). This task also closes the ownership gaps that become exploitable once an AI can call write operations with arbitrary ids. There is no LLM, no new UI, and no new public endpoint in this task.

## Status (checked 2026-09-24): implemented, manual 403 check pending

- [x] Ownership fixes: `assertOwnedCourse` / `assertOwnedTopic` / `assertOwnedLesson`; controllers pass `res.locals.user.id`. Moving a topic/lesson to another parent also checks the target.
- [x] Repository helpers: `getCourseIdByTopicId`, `getCourseIdByLessonId`, `getCourseTree`, `createCourseTree` (one transaction), plus `getNextPosition` for appends.
- [x] All 9 tools in `modules/<feature>/ai/tools/`, registry and `defineTool` in `modules/ai/tools/`.
- [x] Contracts in `packages/contract/src/ai/` (input schemas, `CourseTree`, caps of 30 topics and 30 lessons per topic).
- [x] `ErrorCodeAi`: only `INVALID_TOKEN` (the only code 8.1 throws), with `aiErrorMessages.ts` and `en`/`sr` keys.
- [x] `pnpm --filter api build`, `pnpm typecheck`, `pnpm lint` pass.
- [ ] Manual: another user's token → 403 on `PUT /v1/lessons|topics|courses/:id` and `DELETE /v1/courses/:id`.

## Decisions

- **Tools are defined once and used by both features.** Each tool is `{ name, description, input: ZodSchema, handler(ctx, input) }`, where `ctx = { userId }` (internal `users.id`, not the Supabase auth id). MCP (8.1) and the chat (8.2) only adapt them to their own transport.
- **Tools call the existing services and repositories directly**, not HTTP. There is no duplicated business logic.
- **Every tool checks ownership first.** A tool can only read or write courses whose `creatorId === ctx.userId`. The only exception is `ch_search_public_courses`.
- **Write tools never publish.** `ch_create_course_draft` always sets `status: "draft"`, and no tool accepts `status` or `visibility`. Publishing stays a manual action in the editor. This also means AI writes never trigger `notifyCreatorNewCourse`.
- **Whole-course creation is one transaction.** The main "generate a course" use case inserts course, topics and lessons in one call, so a failure never leaves half a course behind.
- **Content scope is text only**: course/topic/lesson `name` and `description`, plus `position` for ordering. Thumbnails, videos and documents are out of scope.
- **Deletes are not exposed as tools.** YAGNI, and deleting is the riskiest thing an agent could do.

## Ownership Fixes (existing code)

Today `coursesService.updateCourse`/`deleteCourse`, `topicsService.*` and `lessonsService.*` accept an id and never check the caller. Fix this in the services so the existing REST routes are also protected:

- Add `authUserId` to the write methods of `coursesService` (`updateCourse`, `deleteCourse`), `topicsService` (`createTopic`, `updateTopic`, `deleteTopic`) and `lessonsService` (`createLesson`, `updateLesson`, `deleteLesson`). Controllers pass `res.locals.user.id`.
- Reuse `getOwnedCourse` from `coursesService`. Export it as `coursesService.assertOwnedCourse(courseId, authUserId)`.
- Topics resolve topic → course. Lessons resolve lesson → topic → course. Add repository helpers `topicsRepository.getCourseIdByTopicId` and `lessonsRepository.getCourseIdByLessonId`, each with explicit return types.
- Errors: `NotFoundError` with the existing feature codes and `ForbiddenError(ErrorCode.FORBIDDEN)`, the same as `getOwnedCourse`.

The web editor only edits its own courses, so it doesn't change.

## Tool Set

One file per tool group, inside its feature module: `apps/api/src/modules/<courses|topics|lessons>/ai/tools/<feature>Tools.ts`. `apps/api/src/modules/ai/tools/` holds `courseTool.ts` (`CourseTool` type, `defineTool`) and `index.ts` exporting `courseTools` (array) and the `CourseTool` type.

| Tool                    | Kind  | Input                                                                                   | Behavior                                                                                       |
| ----------------------- | ----- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `ch_list_my_courses`       | read  | `{ query?, status?, page?, limit? }`                                                    | Wraps `coursesService.getAllCourses` (own courses only)                                        |
| `ch_get_course`            | read  | `{ courseId }` or `{ publicId }`                                                        | Returns the full tree: course and ordered topics, each with ordered lessons (with descriptions) |
| `ch_search_public_courses` | read  | `{ query?, page?, limit? }`                                                             | Wraps `getAllPublicCourses`. Returns names and descriptions only                               |
| `ch_create_course_draft`   | write | `{ name, description?, topics?: [{ name, description?, lessons?: [{ name, description? }] }] }` | One transaction. Positions come from array order. Returns the new `{ id, publicId }` and the tree |
| `ch_add_topic`             | write | `{ courseId, name, description?, position? }`                                           | Appends when `position` is omitted                                                             |
| `ch_add_lesson`            | write | `{ topicId, name, description?, position? }`                                            | Appends when `position` is omitted                                                             |
| `ch_update_course`         | write | `{ courseId, name?, description? }`                                                     | Text fields only                                                                               |
| `ch_update_topic`          | write | `{ topicId, name?, description?, position? }`                                           |                                                                                                |
| `ch_update_lesson`         | write | `{ lessonId, name?, description?, position? }`                                          |                                                                                                |

- Tool descriptions are written for an LLM reader. Each says what the tool returns, that writes never publish, and when to call `ch_get_course` first.
- Input limits come from the db schema (`varchar(255)` names). Also set a sane cap on array sizes, e.g. ≤ 30 topics and ≤ 30 lessons per topic, so one call can't insert thousands of rows.
- `ch_get_course` output is the one shape both features put into LLM context. Keep it compact, with no timestamps, media ids or creator info.

## Data Access

- `coursesRepository.createCourseTree(data & { creatorId }): Promise<CourseTree>`: a single `db.transaction` that inserts the course, then the topics, then the lessons.
- `coursesRepository.getCourseTree(courseId): Promise<CourseTree | undefined>`: one relational query `courses → topics → lessons` ordered by `position`.
- `CourseTree` type in `packages/contract/src/ai/types.ts`.

## Contracts

`packages/contract/src/ai/` (`schemas.ts`, `types.ts`, `errors.ts`, `index.ts`; re-exported from `src/index.ts`):

- Tool input schemas (`CreateCourseDraftInputSchema`, …). The chat's Apply endpoint (8.2) validates with the same schemas.
- `CourseTreeSchema` / `CourseTree`.
- `ErrorCodeAi { LIMIT_REACHED = "ai_limit_reached", INVALID_TOKEN = "ai_invalid_token", TOOL_FAILED = "ai_tool_failed" }`. Only add the codes 8.1/8.2 actually throw.
- For each code: `packages/shared/src/consts/aiErrorMessages.ts`, wired into `allErrorMessages.ts`, plus `errors.ai.*` in the `en` and `sr` `common.ts` locale files.

## Verification

- `pnpm --filter api build`, `pnpm typecheck`, `pnpm lint`.
- Manual (REST, existing web editor): editing your own course, topics and lessons still works. Using another user's token to `PUT /v1/lessons/:id`, `PUT /v1/topics/:id`, `PUT /v1/courses/:id` or `DELETE /v1/courses/:id` returns 403.
- Tool handlers are covered through 8.1 (MCP Inspector) because there is no test suite.

## Out of Scope

- Any LLM call, API key or UI.
- Delete tools, media tools, and publish/visibility changes through AI.
