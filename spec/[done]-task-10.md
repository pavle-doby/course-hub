# Task 10: Quizzes (AI And Manual Quizzes)

Scope: a course creator adds a quiz to the end of a course, topic or lesson. They either let Claude draft 3–5 questions from the content (**AI Create**) or write them by hand (**Manual Create**), and can edit the quiz later. Enrolled learners take it in the reader with the shadcn [Questionnaire](https://ui.shadcn.com/docs/components/radix/questionnaire) component. Their answers are saved, they see their score, and they can clear their answers to take it again.

Status legend: `[x]` done · `[ ]` todo · `[~]` needs the user (e.g. DB commands).

## Decisions

- **One quiz per course, topic or lesson.** Same parent model as `documents`: nullable `courseId`/`topicId`/`lessonId` with an exactly-one-parent check, and the API addresses it as `/:parentType/:parentId` using `CONTENT_ITEM_TYPES`.
- **Questions are stored as `jsonb` on the quiz row, not in separate tables.** The quiz is always read and saved as a whole, and Zod validates the shape on the way in. `ponytail:` split into `questions`/`choices` tables only if we need per-question queries (e.g. analytics).
- **AI and Manual share one editor form.** AI Create only fills the form. `POST .../generate` returns a draft and **writes nothing**, the creator reviews it, and **Save** goes through the same `PUT` as a manual quiz. This follows the 8.2 rule that the AI never writes directly, and it means edit is simply the form opened with the saved quiz.
- **Three question types**, matching the Quiz component:
  - `single`: radio, exactly one correct choice
  - `multiple`: checkboxes, at least one correct choice
  - `text`: free input. **Not scored**, used for reflection.
- **One saved response per learner per quiz.** `quiz_responses` has `unique(userId, quizId)`. Submitting upserts the answers, and **Clear answers** deletes the row, so the learner starts fresh. Old attempts aren't kept. `ponytail:` add attempt history only if creators or learners ask for it.
- **Answers are saved on submit, not per question.** The Quiz component collects every answer and submits them once at the end. A learner who leaves halfway has nothing saved. `ponytail:` add per-step autosave only if people complain.
- **Answering needs an active enrollment**, the same rule as reviews (`ErrorCodeEnrollment.NOT_ENROLLED`). A visitor who isn't enrolled sees a card with the question count and an "Enroll to take the quiz" hint. A response survives withdrawal, just like progress.
- **Scoring happens on the server.** The public `GET` removes `correct` flags so the answers don't show in the network tab. The result, including the correct choices, is only returned together with the learner's own saved response.
  - A `multiple` answer counts only if the selected set equals the correct set exactly.
  - Score = correct / scored questions, where scored questions are all non-`text` questions.
- **Only answers are stored. The score is computed on read.** Every `GET`/`PUT` of a response recomputes the result against the current quiz. If the creator edits the quiz later, scores stay consistent: answers to removed questions are ignored, and new questions show as unanswered. There is no stored score column that could go stale.
- **AI stack**: the official Anthropic SDK (`@anthropic-ai/sdk`) in `apps/api`. Generation is one `client.messages.parse()` call with `output_config: { effort: "low", format: zodOutputFormat(QuizDraftSchema) }`, so the output comes back validated and typed. There's no streaming and no tool loop. **Model: `claude-sonnet-5`.** (This replaces the Vercel AI SDK idea from 8.2 for this task; 8.2's streamed chat can still decide separately.)
- **AI context is text only.** It sends names and descriptions:
  - **lesson**: the lesson, plus its topic and course names for framing
  - **topic**: the topic and its lessons
  - **course**: the whole tree (`coursesRepository.getCourseTree`, the same data as the `ch_get_course` tool)
    PDFs and videos aren't read. `ponytail:` add document or transcript text only if thin descriptions make the questions too generic.
- **Language**: the draft uses the creator's `user_preferences.language` (`en`/`sr`).
- **Optional creator instructions** (≤ 500 chars, `GenerateQuizBodySchema`) for both AI Create and Regenerate, e.g. focus or difficulty. They go into the user message inside `<creator_instructions>`; the system prompt says to follow them only within the quiz rules (3–5 questions, allowed types).
- **Cost guard**: 20 generations per user per day, counted in memory in `apps/api/src/modules/ai/usage.ts` (`Map<userId, { day, count }>`). Over the limit → 429 `ErrorCodeAi.LIMIT_REACHED`. 8.2 reuses the same helper. `ponytail:` it resets on deploy and isn't shared across instances, which is fine on one Railway instance.
- **Needs a saved parent id.** The Quiz card is hidden until a new course has been saved once (topics and lessons always have ids).

## Supported Flows

| Trigger                                                                       | Effect                                                                                                           |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Creator selects a course/topic/lesson with no quiz                            | **Quiz** card under the editor card with a **Create Quiz** button                                                |
| Creator clicks **Create Quiz**                                                | Dialog with two options: **AI Create** and **Manual Create**                                                     |
| **AI Create**                                                                 | Spinner → `generate` → editor form prefilled with 3–5 questions (unsaved, marked "AI draft")                     |
| **Manual Create**                                                             | Editor form with one empty `single` question                                                                     |
| Creator edits prompt / type / choices / correct flags, adds/removes questions | Local form state (react-hook-form `useFieldArray`)                                                               |
| Creator clicks **Save**                                                       | `PUT` upserts the quiz → cached quiz updated → card shows the question count with **Edit** / **Delete**          |
| Creator clicks **Edit**                                                       | Same form, prefilled from the saved quiz. **Regenerate with AI** replaces the form contents                      |
| Creator clicks **Delete**                                                     | Confirm dialog (`AlertDialog`) → `DELETE`                                                                        |
| Learner reaches the end of a lesson/topic/course that has a quiz              | `<Questionnaire>` rendered after the content (video, documents, description)                                     |
| Enrolled learner submits                                                      | `PUT .../response` saves answers → score card ("4 / 5"), each question marked right/wrong, correct choices shown |
| Learner comes back later                                                      | Saved response loaded → score card with their answers instead of the empty quiz                                  |
| Learner clicks **Clear answers**                                              | Confirm dialog → `DELETE .../response` → empty quiz from question 1                                              |
| Not-enrolled visitor opens a lesson with a quiz                               | Card with the question count and "Enroll to take the quiz"                                                       |
| Creator edits the quiz after learners answered                                | Saved answers kept; results recomputed against the new questions on next load                                    |
| AI daily limit reached                                                        | Toast with localized `errors.ai.LIMIT_REACHED`. Manual Create still works                                        |
| Parent content deleted                                                        | Quiz and its responses removed by FK cascade                                                                     |

## Data Model

`packages/db-schema/src/schemas/quizzes.ts` → `quizzes`:

- `id`, nullable `courseId` / `topicId` / `lessonId` (fk, cascade), `questions jsonb not null`, `createdAt`, `updatedAt`.
- `check ("quizzes_exactly_one_parent", num_nonnulls(course_id, topic_id, lesson_id) = 1)`.
- Unique indexes on `courseId`, `topicId`, `lessonId` (one quiz per parent. Postgres unique allows multiple NULLs).
- Export from `schemas/index.ts`, add relations (`courses/topics/lessons.quiz`, `quizzes.course/topic/lesson`), and add `QuizEntity` to `types.ts`. The column is typed with `.$type<QuizQuestion[]>()` (a plain TS type in `db-schema`, since `@repo/contract` depends on it, not the other way round).

`packages/db-schema/src/schemas/quiz-responses.ts` → `quiz_responses`:

- `id`, `userId` (fk users, cascade), `quizId` (fk quizzes, cascade), `answers jsonb not null` (`.$type<QuizAnswers>()`, i.e. `Record<questionId, string | string[]>`), `createdAt`, `updatedAt`.
- `unique(userId, quizId)`.
- Relations: `users.quizResponses`, `quizzes.responses`, `quizResponses.user/quiz`. Add `QuizResponseEntity`.

Migrations: `0010_questionnaires` (applied) created the tables under their first names, `questionnaires` / `questionnaire_responses.questionnaire_id`. After the rename to quiz, the **user runs** `pnpm db:generate --name rename_questionnaires_to_quizzes` and answers **rename** at drizzle-kit's prompts (`quizzes` ← `questionnaires`, `quiz_responses` ← `questionnaire_responses`, `quiz_id` ← `questionnaire_id`), so existing rows are kept. Constraint and index names are dropped and re-created under the new names.

## Contracts And API

`packages/contract/src/quizzes/` (`schemas.ts`, `types.ts`, `errors.ts`, `index.ts`; re-exported from `src/index.ts`):

```ts
QuizChoiceSchema = z.object({ value: z.string().min(1).max(50), label: z.string().min(1).max(200), correct: z.boolean() });

QuizQuestionSchema = z.discriminatedUnion("type", [
  base.extend({ type: z.literal("single"),   choices: Choices }), // refine: exactly 1 correct
  base.extend({ type: z.literal("multiple"), choices: Choices }), // refine: ≥ 1 correct
  base.extend({ type: z.literal("text") }),
]);
// base = { id /* stable key, maps to Quiz item `name` */, prompt ≤ 500, description? ≤ 500, required }
// Choices = 2–6 choices with unique values

SaveQuizBodySchema   = z.object({ questions: 1–20 questions, unique ids });
QuizDraftSchema      = flat { questions: [{ type, prompt, description?, choices: [{ label, correct }] }] }; // what the model returns
GeneratedQuizSchema  = z.object({ questions: QuizQuestionSchema.array().min(3).max(5) });       // after the server adds ids/values
QuizSchema           = { id, questions, updatedAt };  // creator view, with `correct`; wrapped as QuizOrNull { quiz }
PublicQuizSchema     = { id, questions: [{ id, type, prompt, description?, required, choices: [{ value, label }] }] }; // wrapped as PublicQuizOrNull
QuizAnswersSchema    = z.record(questionId, string ≤ 2000 | string[] ≤ 6);
SaveQuizResponseBodySchema = z.object({ answers: QuizAnswersSchema });
QuizResultSchema     = { score, total, questions: [{ id, isCorrect: boolean | null /* null = text */, correctValues: string[] }] };
MyQuizResponseSchema = { response: { answers, result: QuizResultSchema, updatedAt }.nullable() };
```

- `QuizParentParamsSchema` is an alias of `DocumentParentParamsSchema` (`parentType` + `parentId`).
- `ErrorCodeQuiz { NOT_FOUND, PARENT_NOT_FOUND }` and `ErrorCodeAi.LIMIT_REACHED`, `ErrorCodeAi.GENERATION_FAILED`, each wired into `quizErrorMessages.ts` / `aiErrorMessages.ts` and `errors.quiz.*` / `errors.ai.*` in both `en` and `sr`.

`apps/api/src/modules/quizzes/` (repository → service → controller → routes → openapi):

| Endpoint                                                                     | Behavior                                                                                  |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `GET /v1/quizzes/:parentType/:parentId`                                      | Creator only. Full quiz with `correct`, or `null`.                                        |
| `PUT /v1/quizzes/:parentType/:parentId`                                      | Creator only. Upsert on the parent column. Body validated by `SaveQuizBodySchema`.        |
| `DELETE /v1/quizzes/:parentType/:parentId`                                   | Creator only.                                                                             |
| `POST /v1/quizzes/:parentType/:parentId/generate` (body `{ instructions? }`) | Creator only. Cost guard → build context → Claude → `GeneratedQuiz`. Writes nothing.      |
| `GET /v1/public/quizzes/:parentType/:parentId`                               | Public quiz without `correct` flags, or `null`. Same visibility rule as public documents. |
| `GET /v1/quizzes/:parentType/:parentId/response`                             | Current user's saved answers + recomputed result, or `{ response: null }`.                |
| `PUT /v1/quizzes/:parentType/:parentId/response`                             | Requires active enrollment in the parent's course. Upserts answers → `MyQuizResponse`.    |
| `DELETE /v1/quizzes/:parentType/:parentId/response`                          | Clears the current user's answers. No-op if there are none.                               |

- Private routes mount at `/v1/quizzes` (`apiRoutes.ts`). Public routes mount at `/v1/public/quizzes` (`apiPublicRoutes.ts`).
- Import both OpenAPI files in `src/openapi/spec.ts`, then run `pnpm api-client:generate` and re-export the `quizzes` tag module.
- Parent → course and creator resolution reuses `documentsRepository.getParentCreator`, which now also returns `courseId`.
- The `/response` routes are for learners and skip the creator check. They resolve parent → course id, and `PUT` checks enrollment through `enrollmentsRepository.getEnrollment` (same as `reviewsService.saveReview`).
- Scoring is a pure function `scoreQuiz(questions, answers): QuizResult` in `quizzes/services/scoreQuiz.ts`. Answer keys that don't match a current question id are ignored.
- Repository functions have explicit return types.
- Generation code lives in `quizzes/services/quizGenerator.ts`. It contains:
  - the system prompt, which asks for 3–5 questions testing understanding rather than trivia, mostly `single`/`multiple`, at most one `text`, plausible distractors, and the reply language
  - the context builder
  - the `messages.parse` call
- The model returns no ids or choice values; the generator assigns question ids (`randomUUID`) and choice values (`a`–`f`), so keys are always unique. If the API call fails or the result fails `GeneratedQuizSchema`, it returns `ErrorCodeAi.GENERATION_FAILED` (503).
- Env: `ANTHROPIC_API_KEY` in `apps/api/.env.example` / `env.ts`, documented for the Railway API service in README.deploy.md.

## Web

- `packages/ui-web`: `shadcn add questionnaire checkbox select` (adds `@shadcn/react`); the existing `button.tsx` was kept.
- `apps/web/app/courses/components/quiz/`:
  - `quiz-section.tsx`: a card under the main editor card in `course-working-area.tsx` for the current selection. It shows **Create Quiz**, or a summary ("5 questions") with **Edit** / **Delete**.
  - `quiz-dialog.tsx`: only the choice. The **AI Create** panel has an optional instructions textarea and its own button (spinner while `useGenerateQuiz` runs); **Manual Create** is a plain button. Either choice closes the dialog and the form opens **inline in the Quiz card**, not in a modal. Edit opens the inline form directly.
  - `ai-instructions-input.tsx`: the optional instructions textarea + generate button (react-hook-form, `GenerateQuizBodySchema`). It isn't a `<form>` because it also sits inside the quiz form. **Regenerate with AI** in the form opens it inline (with Cancel) instead of generating right away.
  - `quiz-form.tsx`: the question editor (react-hook-form + `useFieldArray`). Each answer row has a drag handle (`GripVertical`, dnd-kit sortable, pointer + keyboard) to reorder answers. A **Reorder** / **Done** toggle in the card header (top right, only while the form is open) swaps the question fields for a compact draggable list of questions; the form stays mounted, so edits aren't lost.
    - Each question card has a prompt, optional description, type `Select`, a required `Switch`, a choices list with a "Correct" checkbox per choice (exclusive for `single`), and add/remove choice buttons. The choices list is hidden for `text`.
    - Below the cards: **Add question**, **Regenerate with AI**, **Save**. Validation uses `SaveQuizBodySchema` with `useZodLocale`.
- `apps/web/app/learn/[publicId]/components/learn-quiz.tsx`:
  - Renders `<Questionnaire items={...}>` from `useGetPublicQuiz(parent)`. It maps each question to an item: `name` ← `id`, `prompt`, `description`, `choices` (`multiple` → checkbox choices), and `text` → `QuizInput`.
  - Loads `useGetMyQuizResponse(parent)` when enrolled. With a saved response it shows the result view (`QuizResult`, same file): score, each question with the learner's answer marked right/wrong, and the correct choices. Without one it shows the empty `<Questionnaire>`.
  - `onSubmit` converts the `FormData` to `answers` → `useSaveQuizResponse` → sets the query data → result view. A perfect score (all graded answers right) fires `canvas-confetti`, same burst as finishing a course.
  - Correct answers use a green `CircleCheckBig` (`text-green-600 dark:text-green-400`, like lesson "done"); wrong ones a red `XCircle`.
  - **Clear answers** (on the result view) → `AlertDialog` confirm → `useDeleteQuizResponse` → empty quiz from question 1.
  - When not enrolled: the question count and an "Enroll to take the quiz" hint.
  - Rendered last in `learn-working-area.tsx`, after documents and the description.
- `en` / `sr` strings under `courses.quiz.*` and `learn.quiz.*`.

## Plan

- [x] 1. Spec (this file)
- [x] 2. DB schema: `quizzes` + `quiz_responses` tables, checks, unique indexes, relations, entity types
- [x] 3. User ran `pnpm db:generate --name questionnaires` and applied it
- [~] 3b. After the quiz rename: user runs `pnpm db:generate --name rename_questionnaires_to_quizzes` (answer **rename**) and applies it
- [x] 4. Contract: `quizzes/` schemas, types, errors; `ErrorCodeAi.LIMIT_REACHED` / `GENERATION_FAILED`; error messages + `en`/`sr` keys
- [x] 5. API: quiz CRUD + public get + learner response get/save/clear + `scoreQuiz` (repo, service, controller, routes, openapi, mounts)
- [x] 6. API: AI generation — add `@anthropic-ai/sdk`, `ai/usage.ts` cost guard, `quizGenerator.ts`, `ANTHROPIC_API_KEY` in `.env.example` + deploy docs
- [x] 7. `pnpm api-client:generate` + re-export `quizzes`
- [x] 8. `packages/ui-web`: add Quiz + missing primitives
- [x] 9. Web creator: section, create dialog, editor form (create / edit / delete / AI draft / regenerate)
- [x] 10. Web learner: `learn-quiz.tsx` (take / saved result / clear answers / not-enrolled hint)
- [x] 11. i18n `en` / `sr`
- [x] 12. Verify: `pnpm typecheck`, `pnpm lint`, `pnpm build`; update FEATURES.md

## Open Questions

- Should learners have to pass the quiz before a lesson or topic can be marked done? Saved responses make this possible later (tie into `lesson_progress`). It's out of scope for now.
- Should creators see learners' responses and scores (per-quiz results table)? The data is there. Only a creator endpoint and page are missing.
- Should the AI also get the text of attached PDFs? Only if the drafts turn out too generic in practice.
- Should `ch_set_quiz` be exposed as an MCP / 8.2 chat tool? That's cheap once the service exists, but it's left out until someone asks.
