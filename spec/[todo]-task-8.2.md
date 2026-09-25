# Task 8.2: AI Chat In The Course Editor

Depends on `spec/[done]-task-8.0.md`. Scope: a chat panel in the course editor (`apps/web/app/courses/[publicId]/edit`) where the creator asks Claude to draft or improve course content. **The AI never writes directly.** Every change is proposed as an Apply card, and nothing is saved until the user clicks Apply.

## Decisions

- **Every change goes through an Apply card**, including new topics and lessons. The model only gets read tools and *proposal* tools. Proposal tools return the proposal to the UI and write nothing.
- **Apply is a separate, explicit endpoint.** `POST /v1/courses/:id/ai/apply` runs the accepted proposal through the 8.0 write tools in one transaction. It reuses the same validation and ownership checks as MCP.
- **Vercel AI SDK**: `ai` + `@ai-sdk/anthropic` in `apps/api`, and `@ai-sdk/react` (`useChat`) in `apps/web`. It covers streaming, the tool-call loop and message state. Orval doesn't generate hooks for streamed responses, so the chat endpoint is **not** consumed through Orval.
- **Model: `claude-sonnet-5`**, with prompt caching on the system prompt and course-tree block (the tree is resent every turn).
- **Chat history is kept in client state only.** The client sends the full message list each turn. Nothing is stored in the DB, and closing the editor clears the chat. `ponytail:` add persistence only if users ask for it.
- **Context sent with each turn**: the current course tree (`get_course`), the editor `selection` (course/topic/lesson id), and the user's `user_preferences.language`. Claude replies and writes content in that language (`sr`/`en`).
- **Cost guard**: 50 chat turns per user per day, counted in memory (`Map<userId, { day, count }>`). `ponytail:` this resets on deploy and isn't shared across instances, which is fine while the API runs one Railway instance. Over the limit, the endpoint returns 429 `ErrorCodeAi.LIMIT_REACHED`.
- **Only available in edit mode.** The chat needs a `courseId`, so in create mode the panel shows "Save the course first".

## Supported Flows

| Trigger                                                    | Effect                                                                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| User opens the AI tab in the editor's right panel          | Chat panel with quick-action chips for the current selection                                    |
| "Outline topics for this course" (course selected)         | Streamed reply + one Apply card listing the new topics and lessons                              |
| "Draft this lesson" (lesson selected)                      | Apply card showing a before/after of the lesson description                                     |
| "Rewrite for beginners" / free-text request                | Apply card(s) with the updated text                                                             |
| User clicks **Apply**                                      | Apply endpoint runs → topics/lessons/course queries invalidated → tree nav and form refresh     |
| User clicks **Dismiss**                                    | Card collapses to "Dismissed". The model sees this in the next turn                             |
| User edits the course in the form, then keeps chatting     | The next turn sends a fresh tree, so proposals are based on current data                        |
| Daily limit reached                                        | Toast with localized `errors.ai.limitReached`. Input disabled until tomorrow                    |

## Proposal Model

`packages/contract/src/ai/schemas.ts` (extends 8.0):

```ts
CourseChangeSchema = z.discriminatedUnion("op", [
  { op: "update_course", input: UpdateCourseInputSchema },
  { op: "add_topic",     input: AddTopicInputSchema.extend({ lessons?: [...] }) },
  { op: "add_lesson",    input: AddLessonInputSchema },
  { op: "update_topic",  input: UpdateTopicInputSchema },
  { op: "update_lesson", input: UpdateLessonInputSchema },
]);
ProposalSchema = { summary: string, changes: CourseChange[] }  // ≤ 50 changes
ApplyProposalBodySchema = ProposalSchema
ApplyProposalRes = CourseTree
```

- The `input` schemas are the 8.0 tool input schemas, so proposal, Apply and MCP all validate the same way.
- `add_topic` may carry nested lessons, so "outline the course" is one card and not dozens.

## API

`apps/api/src/modules/ai/chat/` (routes → controller → service), mounted privately at `/v1/courses/:id/ai`:

| Endpoint                          | Behavior                                                                                                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /v1/courses/:id/ai/chat`    | `assertOwnedCourse` → rate limit → `streamText({ model: anthropic("claude-sonnet-5"), system, messages, tools, stopWhen: stepCountIs(5) })` → `result.pipeUIMessageStreamToResponse(res)`. |
| `POST /v1/courses/:id/ai/apply`   | `validate(ApplyProposalBodySchema)` → `assertOwnedCourse` → one `db.transaction` running each change via the 8.0 write tools → returns the fresh `CourseTree`.                                |

Chat tools (AI SDK `tool()` wrappers around 8.0 definitions):

- `get_course`: read, bound to this course only.
- `search_public_courses`: read, for "how do others structure this" questions.
- `propose_changes`: input `ProposalSchema`. `execute` returns `{ status: "shown_to_user" }` and writes nothing. The UI renders the tool call's input as the Apply card.

System prompt (`chat/systemPrompt.ts`): role, "never claim you saved anything, always use `propose_changes` for any change", reply language, the selection, and the course tree as a cached block. Keep it short and in one file.

The Apply endpoint goes through OpenAPI (`aiOpenapi.ts` imported in `src/openapi/spec.ts`) so the web gets a generated `useApplyAiProposal` hook. The chat endpoint is registered in OpenAPI for documentation only.

Env: add `ANTHROPIC_API_KEY` to `apps/api/.env.example` and to the env validation in `apps/api/src/env.ts`. Also document it in `README.deploy.md`.

## Web

`apps/web/app/courses/components/`:

- `ai-chat-panel.tsx`: `useChat({ transport: new DefaultChatTransport({ api: \`${API_URL}/v1/courses/${courseId}/ai/chat\`, headers, body: () => ({ selection }) }) })`.
  - Auth: `packages/api-client/src/lib/apiClient.ts` keeps its token provider private. Export a `getAuthToken()` helper from it (hand-written lib, not generated) and use it as `headers: async () => ({ Authorization: \`Bearer ${await getAuthToken()}\` })`.
  - Messages are rendered as text parts. `tool-propose_changes` parts render `AiProposalCard`, and other tool parts render a small "Reading course…" status line.
  - Quick-action chips depend on `selection.type` (course / topic / lesson).
- `ai-proposal-card.tsx`: shows the summary, then the changes grouped by op. New items are listed, and updates show old → new text (old text comes from the current tree data the editor already has). It has **Apply** and **Dismiss** buttons. Apply calls `useApplyAiProposal`, then invalidates `getGetCourseByPublicIdQueryKey`, `getGetTopicsQueryKey` and `getGetLessonsQueryKey`. The card's `applied | dismissed` status is kept in local state, keyed by `toolCallId`. The next request sends it in `body` as `{ proposalStatuses }`, and the system prompt lists it so the model knows what was accepted. Once applied or dismissed, the card is read-only.
- `course-editor.tsx`: the right panel gets tabs **Actions | AI**, reusing the existing `rightOpen` panel. On mobile, AI opens in the same sheet pattern as actions (`actionsOpenMobile`).
- **Unsaved form edits:** if the entity form is dirty when Apply is clicked, save first when auto-save is on. When auto-save is off, show a confirm dialog ("Apply will overwrite unsaved changes"). This stops Apply from silently losing typing.
- i18n: `courses.ai.*` (tab label, placeholder, chips, apply/dismiss/applied/dismissed, create-mode notice) and `errors.ai.limitReached` in `en`/`sr`.
- Follow web conventions: named `handleX` handlers, no inline JSX logic, `md` breakpoint.

## Verification

- `pnpm typecheck`, `pnpm lint`, `pnpm turbo build --filter=api... --filter=web...`.
- Manual (`ANTHROPIC_API_KEY` set):
  1. Open your own course → AI tab → "Outline topics". The reply streams in and one Apply card appears. **The DB is unchanged until you click Apply.**
  2. Apply → the tree nav shows the new topics and lessons in order. The card shows "Applied".
  3. Select a lesson → "Draft this lesson" → the card shows old → new. Apply → the lesson form shows the new text.
  4. Dismiss a proposal and confirm nothing changes. Ask a follow-up and confirm the model knows it was dismissed.
  5. With the user language set to `sr`, replies and generated content are in Serbian.
  6. `POST /ai/chat` or `/ai/apply` on another user's course returns 403. The 51st turn in a day returns 429 with a localized toast.
  7. In create mode, the panel shows the "save first" notice.
- Update `FEATURES.md`.

## Out of Scope

- Persisted chat history, multiple conversations, sharing chats.
- Undo after Apply (the existing editor edits cover this).
- AI-generated thumbnails, videos, documents, quizzes.
- Direct AI writes without approval.
- Chat for learners.

## Open Questions

1. **Daily limit value** (50 turns) is a placeholder. Set it from your Anthropic budget.
2. **Partial apply**: v1 applies a whole card or nothing. Per-change checkboxes can come later if proposals turn out too coarse.
