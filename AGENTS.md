# Course Hub — Agent Instructions

> Architecture map: [ARCHITECTURE.md](ARCHITECTURE.md)

## Stack at a Glance

- **Web**: Next.js 16 (App Router), React 19, Tailwind 4, shadcn/Radix — `apps/web/`
- **API**: Express 5, Node >=22, OpenAPI 3.1 — `apps/api/`
- **DB**: PostgreSQL (Supabase), Drizzle ORM 0.44 — `packages/db-schema/` → `packages/db/`
- **Shared types**: `@repo/contract` (Zod + drizzle-zod) — `packages/contract/`
- **API client**: Orval-generated React Query + Axios — `packages/api-client/src/generated/` (**never edit manually**)

## Hard Rules

- **Never edit `packages/api-client/src/generated/`** — run `pnpm api-client:generate` after any route or schema change.
- **Schema source of truth is `@repo/db-schema`** — update Drizzle tables first, then derive Zod schemas in `@repo/contract`.
- **Cross-package imports use `@repo/<name>`** — never use relative paths between packages.
- **All protected API routes must apply `handleAuth` middleware** (`apps/api/src/middleware/auth.ts`).
- **Validated request data is in `res.locals`, not `req.body`** — the `validate()` middleware writes to `res.locals.body` / `.query` / `.params`.
- **Prefer barrel imports and exports** — import from the nearest `index.ts` barrel, not from deep file paths. Every folder with public exports must have an `index.ts` that re-exports them. Never reach past a barrel (e.g. `import { x } from "@repo/shared/utils"` not `import { x } from "@repo/shared/utils/zod/getZodLocale"`).
- **Always use `{}` braces on `if` statements**, even single-line bodies — never `if (x) return;`.
- **Prefer multiple small files over one big file** — give each component, hook, or group of helpers its own file, and split a file once it holds several distinct pieces or grows past ~200 lines. Keep a component's sub-components beside it (e.g. in its route's `components/` folder), not inline at the bottom of the parent file.
- **Always add an explicit return type on repository functions** — never rely on TypeScript inference for return types in repository code.
- **Agents must never run database commands** — do not run `pnpm db:*`, `drizzle-kit`, `psql`, Supabase SQL, migration, push, reset, seed, or destructive database commands. Agents may update schema source and migration files only when explicitly requested; the user runs all database commands.
- **New OpenCode configuration must use `opencode.jsonc`**, not `opencode.json`.
- **When working in `apps/web/`**, use the shadcn MCP for additional component or design-system context when needed.

## Common Commands

```bash
pnpm dev                  # All apps
pnpm web / pnpm api       # Individual apps
pnpm api-client:generate  # Regenerate OpenAPI + React Query hooks
pnpm db:generate          # New Drizzle migration
pnpm db:push              # Apply schema to DB (dev)
pnpm build && pnpm lint && pnpm typecheck
```

## Non-Obvious Conventions

**The web PWA is the only client.**
Use the standard `/v1/auth/*` token endpoints for every supported platform.

**OpenAPI is registered in code, not YAML.**  
Add `registry.registerPath()` calls in `apps/api/src/modules/<feature>/openapi/<feature>Openapi.ts`, then import it side-effect style in `apps/api/src/openapi/spec.ts`.

**Error handling uses typed classes.**  
Throw `BadRequestError`, `UnauthorizedError`, `NotFoundError`, etc. from `@repo/contract`. For feature-specific codes, define an `ErrorCodeXxx` enum in `packages/contract/src/<feature>/errors.ts`.

## Scoped Instructions

Additional `AGENTS.md` files apply to their directory and all descendants. Consult the closest applicable file when working in `apps/` or `packages/`.

<!-- CODEGRAPH_START -->

## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
<!-- CODEGRAPH_END -->
