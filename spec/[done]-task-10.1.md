# Task 10.1: Quiz Tools For MCP

Depends on `spec/[done]-task-10.md` (quizzes) and `spec/[done]-task-8.1.md` (MCP server). Scope: let coding agents (Claude Code, claude.ai connectors) read, create, replace and delete the quiz on a course, topic or lesson the user created, through the existing MCP server.

Status legend: `[x]` done · `[ ]` todo · `[~]` needs the user (e.g. DB commands).

## Status

- [x] `SaveQuizInputSchema` / `SaveQuizInput` in `@repo/contract` (`ai/`).
- [x] `ch_get_quiz`, `ch_save_quiz`, `ch_delete_quiz` in `apps/api/src/modules/quizzes/ai/tools/quizzesTools.ts`, registered in `courseTools`.
- [x] `FEATURES.md` updated.
- [x] `pnpm --filter api build`, `pnpm typecheck`, `pnpm lint` pass.
- [ ] Manual: from Claude Code, `ch_get_course` → `ch_save_quiz` on a lesson → quiz shows in the editor's Quiz card and in the reader.
- [ ] Manual: `ch_save_quiz` on another user's lesson → "Forbidden" message.

## Decisions

- **No LLM on our side**, the same rule as 8.1. The agent's own model writes the questions; the tools only validate and save. The server-side generator (`POST .../generate`, `quizGenerator.ts`) is not exposed, so MCP calls never spend the platform Anthropic key or count toward the daily AI limit.
- **Thin wrappers over `quizzesService`.** `getQuiz`, `saveQuiz` and `deleteQuiz` already check that the caller created the parent course (`assertCreator`), so the tools add no auth logic.
- **Same parent model as the REST API**: every tool takes `parentType` (`course` | `topic` | `lesson`) and `parentId` (from `ch_get_course`).
- **Save replaces the whole quiz.** `ch_save_quiz` takes the same `questions` array as `PUT /v1/quizzes/:parentType/:parentId` (`SaveQuizBodySchema`: 1–20 questions, `single` / `multiple` / `text`, 2–6 choices, correct-flag rules). The agent reads with `ch_get_quiz` first when it wants to edit an existing quiz. `ponytail:` no per-question add/update tools; a quiz is small enough to send whole.
- **Agent supplies ids and choice values.** Unlike the generator, which assigns them on the server, the agent picks short unique `id`s per question and `value`s per choice (e.g. `q1`, `a`/`b`/`c`). Zod rejects duplicates.
- **Takes effect immediately.** Unlike AI Create in the web app there is no draft step: the tool writes the quiz and learners see it on the next load, the same as the other MCP write tools (which edit course content directly). Saving over an existing quiz keeps learners' responses; they're rescored against the new questions on read (10 rule).
- **Learners can't use these tools.** They're creator-only; quizzing an enrolled learner in chat still works with `ch_get_enrolled_course`, with nothing saved.

## Tools

| Tool             | Input                                 | Returns                                                               |
| ---------------- | ------------------------------------- | --------------------------------------------------------------------- |
| `ch_get_quiz`    | `{ parentType, parentId }`            | `{ quiz: { id, questions, updatedAt } \| null }` (with correct flags) |
| `ch_save_quiz`   | `{ parentType, parentId, questions }` | `{ id, questions, updatedAt }`                                        |
| `ch_delete_quiz` | `{ parentType, parentId }`            | `{ deleted: true }`                                                   |

Errors go through the MCP server's `toErrorMessage`: another user's course → "Forbidden…", unknown parent (`quiz_parent_not_found`) → "Not found… Check the id with ch_list_my_courses or ch_get_course". Invalid `questions` are rejected by the SDK's input validation before the handler runs.

## Files

- `packages/contract/src/ai/schemas.ts`, `types.ts`: `SaveQuizInputSchema = QuizParentParamsSchema.extend(SaveQuizBodySchema.shape)`. Get/delete reuse `QuizParentParamsSchema`.
- `apps/api/src/modules/quizzes/ai/tools/quizzesTools.ts`: the three tools.
- `apps/api/src/modules/ai/tools/index.ts`: add them to `courseTools` (so the 8.2 chat gets them too).
