# Aura Monorepo — Copilot Instructions

> Architecture map: [ARCHITECTURE.md](../ARCHITECTURE.md)

## Stack at a Glance

- **Web**: Next.js 16 (App Router), React 19, Tailwind 4, shadcn/Radix — `apps/web/`
- **Mobile**: Expo 55, React Native 0.83, NativeWind, Expo Router — `apps/native/`
- **API**: Express 5, Node ≥20, OpenAPI 3.0 — `apps/api/`
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

## Common Commands

```bash
pnpm dev                  # All apps
pnpm web / pnpm api       # Individual apps
pnpm api-client:generate  # Regenerate OpenAPI + React Query hooks
pnpm db:generate          # New Drizzle migration
pnpm db:push              # Apply schema to DB (dev)
pnpm build && pnpm lint && pnpm check-types
```

## Non-Obvious Conventions

**Auth endpoints are platform-split; everything else is shared.**  
`POST /auth/login` sets an HTTP-only cookie (web); `POST /auth/login/native` returns tokens in JSON (mobile). All non-auth endpoints serve both platforms from a single route.

**OpenAPI is registered in code, not YAML.**  
Add `registry.registerPath()` calls in `apps/api/src/modules/<feature>/openapi/<feature>.ts`, then import it side-effect style in `apps/api/src/openapi/spec.ts`.

**Error handling uses typed classes.**  
Throw `BadRequestError`, `UnauthorizedError`, `NotFoundError`, etc. from `@repo/contract`. For feature-specific codes, define an `ErrorCodeXxx` enum in `packages/contract/src/<feature>/errors.ts`.

## Skills

| Skill      | Trigger                                      | What it does                                                    |
| ---------- | -------------------------------------------- | --------------------------------------------------------------- |
| `blazing`  | "blazing", "blp", "full stack mode"          | Activates CodeGraph + Context7 + Caveman + Ponytail all at once |
| `caveman`  | "caveman", "less tokens", "be brief"         | Ultra-compressed token-efficient responses                      |
| `ponytail` | "ponytail", "lazy mode", "simplest solution" | Forces laziest solution that works — YAGNI enforcer             |

## Per-Package Instructions

Detailed conventions are auto-loaded when you work in these paths:

| Path                     | Instruction file                                                      |
| ------------------------ | --------------------------------------------------------------------- |
| `apps/api/**`            | [api.instructions.md](instructions/api.instructions.md)               |
| `packages/contract/**`   | [contract.instructions.md](instructions/contract.instructions.md)     |
| `packages/db-schema/**`  | [db-schema.instructions.md](instructions/db-schema.instructions.md)   |
| `packages/db/**`         | [db.instructions.md](instructions/db.instructions.md)                 |
| `packages/api-client/**` | [api-client.instructions.md](instructions/api-client.instructions.md) |
| `packages/ui-web/**`     | [ui.instructions.md](instructions/ui.instructions.md)                 |
| `packages/ui-native/**`  | [ui-native.instructions.md](instructions/ui-native.instructions.md)   |
| `packages/ui-theme/**`   | [ui-theme.instructions.md](instructions/ui-theme.instructions.md)     |
| `packages/i18n/**`       | [i18n.instructions.md](instructions/i18n.instructions.md)             |
| `packages/scripts/**`    | [scripts.instructions.md](instructions/scripts.instructions.md)       |
| `apps/web/**` `apps/native/**` | [forms.instructions.md](instructions/forms.instructions.md)   |
