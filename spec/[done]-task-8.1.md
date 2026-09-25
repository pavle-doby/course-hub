# Task 8.1: MCP Server For Coding Agents

Depends on `spec/[done]-task-8.0.md`. Scope: expose the shared course tools over MCP so coding agents (Claude Code, Cursor, etc.) can read a creator's courses and generate new ones. Agents authenticate with personal access tokens (PATs) that users create in Settings.

## Status (checked 2026-09-24): implemented, most manual checks pending

- [x] `api_tokens` table, relations, `ApiTokenEntity`, migration `0006_api_tokens.sql` (applied: the MCP call below authenticated).
- [x] Contracts, `ErrorCodeApiToken`, error messages and `en`/`sr` keys.
- [x] `/v1/api-tokens` module (GET/POST/DELETE), OpenAPI, Orval hooks, re-export in `api-client`.
- [x] `handleTokenAuth` (`lastUsedAt` update throttled to once a minute), `/apix` prefix, stateless MCP at `POST /apix/v1/mcp`, 405 for other methods, `ch_generate_course` prompt, English tool errors.
- [x] Settings → AI access card: list, create dialog with a shown-once token, JSON and `claude mcp add` snippets, revoke with confirmation, `MCP_URL`.
- [x] `FEATURES.md` and `README.deploy.md` updated.
- [x] `pnpm --filter api build`, `pnpm typecheck`, `pnpm lint` pass.
- [x] Manual 2/3 (partial): a real PAT from Claude Code → `ch_list_my_courses` returned the user's own courses.
- [ ] Manual 1, 3 (`ch_create_course_draft` → draft visible in the web app), 4 (forbidden on another user's course), 5 (revoke → 401), 6 (PAT on `/api/v1/courses` → 401).

## Decisions

- **No LLM on our side.** The agent's own model writes the content, and our tools validate and save it. No AI API key is needed for this task.
- **Transport: Streamable HTTP, served by the existing API** at `POST /apix/v1/mcp` with the official `@modelcontextprotocol/sdk`. It needs no extra Railway service, and agents only need a URL and a header.
- **Stateless mode.** Each request builds a server with the tools bound to the request's `userId` and handles it. There is no session store (`sessionIdGenerator: undefined`). Notifications and subscriptions aren't needed.
- **Auth: personal access tokens.** Supabase JWTs expire after about an hour, which is unusable in a static MCP config. OAuth for MCP is out of scope (see Open Questions).
- **PAT format `ch_pat_<32 random bytes base64url>`.** Only a SHA-256 hash is stored, and the plaintext is shown once at creation. SHA-256 (not bcrypt) is fine because the token has high entropy, and lookup by hash stays O(1).
- **PATs only work on the MCP route.** They can't call the REST API, which keeps the blast radius of a leaked token to the course tools.
- **MCP is not part of OpenAPI or Orval.** It's its own protocol. The token management endpoints are normal REST and do go through OpenAPI.

## Supported Flows

| Trigger                                          | Effect                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| User creates a token in Settings → AI access     | Token shown once with a copy button and a ready-to-paste MCP config snippet     |
| Agent calls `tools/list`                         | Returns the 8.0 tool set                                                        |
| Agent calls `ch_get_course` / `ch_list_my_courses`     | Returns the user's own data                                                     |
| Agent calls `ch_create_course_draft`                | Draft course created. It shows up in the user's Courses list, unpublished       |
| User revokes a token                             | Further MCP calls with it return 401 immediately                                |
| Request without a token, or with a bad one       | 401 JSON error, no tool access                                                  |

## Data Model

`packages/db-schema/src/schemas/api-tokens.ts`:

- `id` UUID primary key, default random.
- `userId` foreign key → `users.id`, `onDelete: "cascade"`.
- `name` varchar(100), not null (user label, e.g. "Claude Code laptop").
- `tokenHash` varchar(64), not null, unique.
- `tokenPrefix` varchar(16), not null (first characters, shown in the list so users can tell tokens apart).
- `lastUsedAt` nullable timestamp; `revokedAt` nullable timestamp.
- `createdAt` timestamp (`{ withTimezone: true }`).

Update `relations.ts`, `schemas/index.ts` and `types.ts` (`ApiTokenEntity`).

Migration: **user runs** `pnpm db:generate --name api_tokens`.

## Contracts And API

`packages/contract/src/api-tokens/`:

- `ApiTokenSchema`: `{ id, name, tokenPrefix, lastUsedAt, createdAt }` (never the hash).
- `CreateApiTokenBodySchema`: `{ name }`. `CreateApiTokenRes`: `ApiToken & { token }`, where plaintext `token` appears only in this response.
- `ErrorCodeApiToken { NOT_FOUND = "api_token_not_found" }` plus error messages and `en`/`sr` keys.

`apps/api/src/modules/api-tokens/` (repository → service → controller → routes → openapi), mounted privately at `/v1/api-tokens`:

| Endpoint                     | Behavior                                                   |
| ---------------------------- | ---------------------------------------------------------- |
| `GET /v1/api-tokens`         | The user's active (non-revoked) tokens, newest first       |
| `POST /v1/api-tokens`        | Generates a token, stores its hash, returns plaintext once |
| `DELETE /v1/api-tokens/:id`  | Sets `revokedAt` (own tokens only)                         |

`ponytail:` no per-user token limit and no expiry date in v1. Revoking is the control.

## MCP Endpoint

`apps/api/src/modules/ai/mcp/`:

- `handleTokenAuth` middleware (`apps/api/src/middleware/tokenAuth.ts`): reads `Authorization: Bearer ch_pat_…`, hashes it, looks up the active row, and sets `res.locals.userId`. It updates `lastUsedAt` as fire-and-forget, throttled to once per minute per token (`ponytail:`).
- `mcpServer.ts`: `createMcpServer(userId)` registers each entry of `courseTools` with `server.registerTool(name, { description, inputSchema }, handler)`. Tool errors map to MCP `isError: true` results with a plain English message (not localized), because agents read English.
- Add one MCP prompt, `ch_generate_course`, with arguments `{ topic, audience?, lessonsPerTopic? }`. It is a template that tells the agent the expected tree shape and tone and ends with "call `ch_create_course_draft`".
- Route: `POST /apix/v1/mcp` (and `GET`/`DELETE` returning 405, per the stateless Streamable HTTP pattern). `/apix` is the prefix for routes used by external systems (not the web app), so it stays outside the JWT `handleAuth` that guards `/api`. `server.ts` only mounts the prefix, and `src/routes/apixRoutes.ts` holds the per-route mounts with their own auth:
  ```ts
  // server.ts
  app.use("/apix", apixRoutes);
  // routes/apixRoutes.ts
  apix.use("/v1/mcp", handleTokenAuth, mcpRoutes);
  ```
- CORS is irrelevant because agents are not browsers. Keep the existing CORS config.

## Web

`apps/web/app/settings/`: add an **AI access** card below the existing preferences:

- A list of tokens (name, prefix, last used, created) with a Revoke button and a confirm dialog.
- A **Create token** button that opens a dialog with a name field → shows the token once with a copy button and the config snippet:
  ```json
  {
    "mcpServers": {
      "course-hub": {
        "type": "http",
        "url": "<API origin>/apix/v1/mcp",
        "headers": { "Authorization": "Bearer <token>" }
      }
    }
  }
  ```
  Also show the Claude Code one-liner: `claude mcp add --transport http course-hub <url> --header "Authorization: Bearer <token>"`.
  The web app derives `<url>` from `NEXT_PUBLIC_API_URL` by replacing its trailing `/api` with `/apix` (`MCP_URL` in `apps/web/utils/consts.ts`).
- Use the generated hooks (`useGetApiTokens`, `useCreateApiToken`, `useDeleteApiToken`), add `settings.aiAccess.*` in `en`/`sr`, and follow web conventions (named `handleX` handlers, `md` breakpoint).

Run `pnpm api-client:generate` and re-export the `api-tokens` tag module from `packages/api-client/src/index.ts`.

## Verification

- `pnpm typecheck`, `pnpm lint`, `pnpm turbo build --filter=api... --filter=web...`.
- Manual:
  1. Create a token in Settings and confirm it's shown once. Reloading shows only the prefix.
  2. `npx @modelcontextprotocol/inspector`, Streamable HTTP, `http://localhost:7007/apix/v1/mcp` with the header → `tools/list` shows the 8.0 tools.
  3. `claude mcp add …` and ask Claude Code to "list my courses" and then "create a draft course about X with 3 topics". The draft appears in the web Courses list, unpublished, with topics and lessons in order.
  4. `ch_get_course` on another user's course returns a forbidden tool error.
  5. Revoke the token and confirm the next call returns 401.
  6. The same token against `GET /api/v1/courses` returns 401 (PATs are MCP-only).
- Update `FEATURES.md` and `README.deploy.md` (no new env vars. Note that the MCP URL is `<API origin>/apix/v1/mcp`).

## Out of Scope

- OAuth / dynamic client registration for MCP.
- Token scopes (read-only tokens), expiry dates, and per-token rate limits.
- MCP resources and subscriptions.

## Open Questions

1. **Read-only tokens**: a `scope: "read" | "write"` column is cheap to add now and saves a migration later. Recommended only if you expect to share tokens with less-trusted tools. Deferred by default.
