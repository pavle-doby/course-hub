# Course Hub — Copilot Instructions

See [ARCHITECTURE.md](../ARCHITECTURE.md) for system design, data flow, and structural rules.

## Build & Run

```bash
yarn                        # install
yarn api                    # build all + start API
yarn web                    # build all + start Next.js
yarn test                   # Vitest unit tests
yarn db:generate            # regenerate Drizzle types from schema
yarn db:push                # run migrations
yarn api-client:generate    # regenerate API client (API must be running)
```

## Naming Conventions

- Classes: `{Feature}Controller`, `{Feature}Repository`
- Functions/instances: `{feature}Service`
- Request DTOs: `{Feature}{Action}Req` (e.g., `AuthSignUpReq`)
- Response DTOs: `{Feature}{Action}Res` or shared type (e.g., `User`)
- Zod schemas: `{Feature}{Action}QuerySchema`

## Code Style

- Linter: Biome (`biome check .`). `noExplicitAny` and `noNonNullAssertion` are off.
- No `req.body` — use `res.locals.body` for validated request data.
- Never edit `packages/api-client/src/generated/` by hand.
- Define contracts in `packages/contract/src/<feature>/` before writing API or UI code.
- DB table definitions go in `packages/db-schema/`; DB client goes in `packages/db/`.

## Required ENV (apps/api)

`SERVER_PORT`, `SUPABASE_URL`, `SUPABASE_API_KEY`, `DATABASE_URL`, `CORS_ENABLED_URL`, `NODE_ENV`, `MIN_LOG_LEVEL` — loaded from `.env` / `.env.local`.
