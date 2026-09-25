# Task 10.2: AI Usage Tracking And Bring-Your-Own Anthropic Key

Depends on `spec/[done]-task-10.md`. Scope: (1) every AI call is saved to the database, so we can track usage per user and see statistics; (2) a user can add their own Anthropic API key, and quiz generation then runs on their account instead of ours.

Status legend: `[x]` done · `[ ]` todo · `[~]` needs the user (e.g. DB commands).

## Decisions

### Usage tracking

- **One `ai_usage` row per AI call**, written after the call finishes, whether it succeeded or failed. The row stores the Anthropic `response.usage` (`input_tokens`, `output_tokens`), the model, the feature, the key source and the status. Token counts are `0` when the call never reached Anthropic.
- **`feature` is a text enum.** The only value today is `quiz_generate`. 8.2 chat adds its own value when it lands. `ponytail:` no per-feature tables.
- **The daily cost guard moves from memory to the DB.** `consumeAiUsage` becomes an async check that counts today's rows for the user (`keySource = 'platform'`, UTC day), using the `(user_id, created_at)` index. This replaces the in-memory `Map` and its "resets on deploy" `ponytail:`. The limit stays at 20 generations a day. A small race (two parallel requests both passing at 19) is acceptable.
  - Failed calls count too, so retrying a broken prompt can't bypass the limit.
- **Only platform-key calls count toward the limit.** Calls on the user's own key are recorded but never limited, because the user pays for them.
- **No money column.** We store tokens. Cost is computed on read from a small `MODEL_PRICES` map in `ai/usage.ts` (USD per million input/output tokens). When prices change we edit that map, and the stored data is never wrong. `ponytail:` store a cost snapshot only if we ever bill users.
- **Rows are never updated.** Usage is append-only, and a row is deleted only by the FK cascade when the user is deleted.
- **Statistics:**
  - **User**: on the AI Connect page, the **AI usage** card shows "N / 20 generations today" (or "Using your own key, no daily limit") and this month's call count and tokens.
  - **Admin**: `GET /v1/admin/ai-usage?from&to` returns totals per user (calls, failed calls, input/output tokens, estimated cost, split by key source), sorted by cost. It uses `validateRole("admin")`. The first version is a plain table on an admin-only `/admin/ai-usage` page. `ponytail:` no charts, no per-day breakdown until someone asks.

### Bring your own key (BYOK)

- **It's an Anthropic API key (`sk-ant-api…`) from the Claude Console, billed to the user's API account.** A Claude.ai Pro/Max **subscription** can't be used: Anthropic doesn't allow third-party apps to call Claude with a consumer subscription's credentials. The UI copy says this plainly and links to the Console's API keys page.
- **One key per user**, stored in a new `user_ai_keys` table (`unique(user_id)`), not in `user_preferences`, so the secret never goes out with the preferences payload.
- **Encrypted at rest, not hashed.** Unlike PATs (8.1), we have to send the plaintext to Anthropic, so a hash won't do. Use AES-256-GCM with `node:crypto` (`createCipheriv`), a random 12-byte IV per key, and store `iv:authTag:ciphertext` as base64 text. The key is `AI_KEY_ENCRYPTION_SECRET` (32 bytes, base64) in `env.ts` / `.env.example` / README.deploy.md. No new dependency.
  - `ponytail:` no key rotation. If the secret changes, stored keys fail to decrypt, and users are asked to re-enter them (treated like an invalid key).
- **The key is never returned.** The API returns only `{ hasKey, last4, createdAt, lastUsedAt }`. The web app shows `sk-ant-…abcd`.
- **Checked on save.** `PUT` makes one cheap `client.models.list({ limit: 1 })` call with the new key. On a 401 it returns 400 `ErrorCodeAi.INVALID_API_KEY` and saves nothing. (`ErrorCodeAi.INVALID_TOKEN` already means a bad PAT on the MCP route, so we add a separate code.)
- **Key choice per call:** if the user has a key, it's used, with no fallback to the platform key. Falling back would quietly spend our money when their key is broken or out of credit. Errors from their key map to:
  - 401 from Anthropic → 400 `ErrorCodeAi.INVALID_API_KEY` ("Your Anthropic key was rejected. Update or remove it in AI Connect.")
  - 402/403/429 from Anthropic (no credit, permission, rate limit) → 400 `ErrorCodeAi.USER_KEY_REJECTED`, with the Anthropic message logged, not shown
  - anything else → the existing 503 `GENERATION_FAILED`
- **Whose key: the user who clicks Generate**, i.e. the course creator (`assertCreator` already resolves this). Learners never trigger AI calls.
- **Client per call.** `quizGenerator.ts` gets the `Anthropic` client as an argument. `ai/client.ts` exports `getAnthropicClient(userId): Promise<{ client, keySource }>`, which returns `new Anthropic({ apiKey })` for a user key or the shared platform client. The SDK client is cheap to create, so there's no cache.
- **Removing the key** deletes the row. The next call goes back to the platform key and the daily limit.

## Supported Flows

| Trigger                                                    | Effect                                                                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Creator generates a quiz (platform key)                    | Limit checked from DB → Claude call → `ai_usage` row (`platform`, tokens, `success`)             |
| Generation fails                                           | `ai_usage` row with `status = 'failed'` (counts toward the limit) → existing error toast         |
| 21st platform generation today                             | 429 `LIMIT_REACHED`; toast suggests adding their own key in AI Connect                           |
| User opens AI Connect                                      | **AI usage** card (today / this month) and **Anthropic API key** card                            |
| User saves a key                                           | Key checked with Anthropic → encrypted → saved → card shows `sk-ant-…abcd`; bad key → inline error |
| Creator generates with their own key                       | No limit check → Claude call on their key → `ai_usage` row (`user`) → `lastUsedAt` updated       |
| Their key is revoked / out of credit                       | Localized `INVALID_API_KEY` / `USER_KEY_REJECTED` toast with a link to AI Connect; no fallback   |
| User removes the key                                       | Confirm dialog → `DELETE` → back to the platform key and the daily limit                         |
| Admin opens `/admin/ai-usage`                              | Per-user totals for the chosen range (default: current month)                                    |
| User deleted                                               | Their `ai_usage` and `user_ai_keys` rows removed by FK cascade                                   |

## Data Model

`packages/db-schema/src/schemas/ai-usage.ts` → `ai_usage`:

- `id`, `userId` (fk users, cascade, not null), `feature` (`aiFeatureEnum`: `quiz_generate`), `model varchar(100)`, `keySource` (`aiKeySourceEnum`: `platform` | `user`), `status` (`aiUsageStatusEnum`: `success` | `failed`), `inputTokens integer not null default 0`, `outputTokens integer not null default 0`, `createdAt`.
- Index on `(user_id, created_at)`.
- Enums in `enums.ts`. Relations: `users.aiUsage`, `aiUsage.user`. Entity type `AiUsageEntity`.

`packages/db-schema/src/schemas/user-ai-keys.ts` → `user_ai_keys`:

- `id`, `userId` (fk users, cascade, **unique**), `encryptedKey text not null`, `last4 varchar(4) not null`, `lastUsedAt` (nullable), `createdAt`, `updatedAt`.
- Relations: `users.aiKey` (one), `userAiKeys.user`. Entity type `UserAiKeyEntity`.

Migration: the **user runs** `pnpm db:generate --name ai_usage_and_keys` and applies it.

## Contracts And API

`packages/contract/src/ai/` (next to the existing `errors.ts`):

```ts
SaveAiKeyBodySchema = z.object({ apiKey: z.string().trim().startsWith("sk-ant-").min(20).max(300) });
AiKeySchema         = z.object({ hasKey: z.boolean(), last4: z.string().nullable(), createdAt, lastUsedAt: nullable });
MyAiUsageSchema     = z.object({
  keySource: z.enum(["platform", "user"]),
  today: { calls, limit: number | null },              // limit null when using own key
  month: { calls, inputTokens, outputTokens },
});
AiUsageStatsQuerySchema = z.object({ from: z.iso.date().optional(), to: z.iso.date().optional() });
AiUsageStatsSchema  = z.object({ users: [{ userId, email, calls, failedCalls, platformCalls, userKeyCalls, inputTokens, outputTokens, estimatedCostUsd }] });
```

- `ErrorCodeAi` gains `INVALID_API_KEY` and `USER_KEY_REJECTED`, wired into `aiErrorMessages.ts` and `errors.ai.*` in both `en` and `sr`.

`apps/api/src/modules/ai/`:

- `usage.ts`: `assertAiLimit(userId)` (DB count, throws 429), `recordAiUsage({ userId, feature, model, keySource, status, usage? })`, `MODEL_PRICES`, `estimateCost(model, input, output)`.
- `client.ts`: `getAnthropicClient(userId)`, `encryptKey` / `decryptKey` (AES-256-GCM), `mapAnthropicError(error, keySource)`.
- `repository/aiRepository.ts`: usage insert / count-today / month totals / admin aggregate, and key get / upsert / delete / touch `lastUsedAt`. Explicit return types.
- `services`, `controllers`, `routes`, `openapi/aiOpenapi.ts` for the endpoints below. Mount at `/v1/ai` (and `/v1/admin/ai-usage`) in `apiRoutes.ts`, import the openapi file in `src/openapi/spec.ts`, run `pnpm api-client:generate`, and re-export the new tag module.

| Endpoint                     | Behavior                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `GET /v1/ai/key`             | Current user's key status (`AiKey`). Never the key itself.                                 |
| `PUT /v1/ai/key`             | Checks the key with Anthropic, encrypts it, and upserts it. 400 `INVALID_API_KEY` if bad.  |
| `DELETE /v1/ai/key`          | Removes the key. No-op if there is none.                                                   |
| `GET /v1/ai/usage`           | Current user's `MyAiUsage`.                                                                 |
| `GET /v1/admin/ai-usage`     | `validateRole("admin")`. Per-user `AiUsageStats` for `from`–`to` (default: current month). |

Quiz generation changes (`quizzesService.generateQuiz` / `quizGenerator.ts`):

1. `const { client, keySource } = await getAnthropicClient(userId)`.
2. `keySource === "platform"` → `await assertAiLimit(userId)`.
3. `generateQuiz(client, …)` returns the draft **and** the `response.usage` (or throws).
4. `recordAiUsage(...)` in a `finally`, so failures are recorded too. A failed insert is logged and never fails the request.
5. `keySource === "user"` → update `lastUsedAt`.

## Web

- `apps/web/app/ai-connect/components/`:
  - `ai-usage-card.tsx`: today's count against the limit (`Progress`), or the "own key" note, plus this month's calls and tokens. It's refetched after a quiz generation (invalidate the `useGetMyAiUsage` query in `useGenerateQuiz`'s `onSuccess`/`onError`).
  - `anthropic-key-card.tsx`: without a key, a password `Input` + **Save** (react-hook-form, `SaveAiKeyBodySchema`, `useZodLocale`), a short explanation (Console API key, billed to you, a Claude.ai subscription won't work) and a link to the Console. With a key, `sk-ant-…abcd`, last used, **Replace** and **Remove** (`AlertDialog`).
- The quiz dialog's AI panel shows "Using your Anthropic key" or "N generations left today" under the generate button (from `useGetMyAiUsage`). The `LIMIT_REACHED` toast gets an **Add your own key** link to `/ai-connect`.
- `apps/web/app/admin/ai-usage/page.tsx`: admin-only table (email, calls, failed, platform/own, tokens, est. cost) with a month picker. Hidden from nav for non-admins; the API enforces the role anyway.
- `en` / `sr` strings under `aiConnect.usage.*`, `aiConnect.key.*`, `admin.aiUsage.*`.

## Plan

- [x] 1. Spec (this file)
- [ ] 2. DB schema: `ai_usage` + `user_ai_keys` tables, enums, index, relations, entity types
- [~] 3. User runs `pnpm db:generate --name ai_usage_and_keys` and applies it
- [ ] 4. Contract: `ai/` schemas and types; `ErrorCodeAi.INVALID_API_KEY` / `USER_KEY_REJECTED`; error messages + `en`/`sr` keys
- [ ] 5. API: `ai/client.ts` (encryption, client choice, error mapping), `ai/usage.ts` on the DB, repository, key + usage + admin endpoints, openapi, mounts; `AI_KEY_ENCRYPTION_SECRET` in `env.ts` / `.env.example` / README.deploy.md
- [ ] 6. API: quiz generation uses the per-user client, records usage, and checks the limit only on the platform key
- [ ] 7. `pnpm api-client:generate` + re-export the new tag module
- [ ] 8. Web: AI usage card, Anthropic key card, quiz dialog hint + limit toast link
- [ ] 9. Web: admin AI usage page
- [ ] 10. i18n `en` / `sr`
- [ ] 11. Verify: `pnpm typecheck`, `pnpm lint`, `pnpm build`; update FEATURES.md

## Open Questions

- Should users with their own key choose the model (e.g. Opus for better drafts)? It's cheap to add as a `model` column on `user_ai_keys`, but it's left out until someone asks.
- Should the platform limit be per plan or per role (e.g. admins unlimited)? For now it's one constant.
- Should we keep old `ai_usage` rows forever? At one row per generation the table stays small. Add a retention job only if it grows.
- Should the MCP route (8.1) also be tracked? No, because the agent's own model does the work there, so no AI call is made on our side.
