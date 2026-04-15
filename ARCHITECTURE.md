# Architecture

## Tech Stack

- **API**: Express.js v5, Drizzle ORM, PostgreSQL, Supabase Auth
- **Web**: Next.js (App Router), Tamagui, React Query
- **Mobile**: Expo, React Native, Tamagui
- **Monorepo**: Turborepo + Yarn 4 workspaces
- **Validation**: Zod (shared via `@my/contract`)
- **API Client**: Orval (OpenAPI → React Query hooks, auto-generated)

## Project Structure

```
apps/api/           # Express.js REST API
apps/next/          # Next.js web app
apps/expo/          # Expo mobile app
packages/
  contract/         # Zod schemas + TS types — source of truth for DTOs
  db-schema/        # Drizzle table definitions
  db/               # DB client + migrations
  app/              # Cross-platform feature screens & providers
  api-client/       # Auto-generated React Query hooks (never edit manually)
  ui/               # Shared Tamagui component library
  config/           # Tamagui tokens & theme
```

## API Module Structure

Each feature under `apps/api/src/modules/<feature>/`:

```
routes/         # Express Router + validate() middleware
controllers/    # Extract res.locals.body, call service, send response
services/       # Business logic (calls Supabase + repository)
repository/     # Drizzle ORM queries only — no business logic
openapi/        # OpenAPI schema declarations for spec generation
```

## Data Flow

```
Client → POST /v1/<feature>/<action>
  → validate() middleware (Zod schema from @my/contract)
  → res.locals.body (validated DTO)
  → Controller → Service → Repository → DB
  → Response DTO sent back
```

- Validated data is always on `res.locals[source]`, never `req.body`
- Error handling middleware must be registered last in `server.ts`

## Authentication Flow

```
Request → handleAuth middleware
  → Extract token from HTTP-only cookie (access_token)
  → supabase.auth.getUser(token)
  → Store user in res.locals.user
  → UnauthorizedError if invalid
```

- Tokens (access + refresh) are set as HTTP-only cookies via `setAuthTokens`
- Public routes: `/v1/auth/*`
- Protected routes: apply `handleAuth` middleware in `apiRoutes.ts`

## API Design

- Versioned routes: `/v1/<resource>`
- Middleware order: `CORS → json → cookieParser → logs → routes → errorHandler`
- OpenAPI spec generated at build time; Orval reads it to generate the client
- Re-run `yarn api-client:generate` after any API change (API must be running)

## Key Architectural Rules

- **Contract first**: Define `packages/contract/src/<feature>/` (schemas + types) before writing API or UI code
- **No cross-layer calls**: Repository → DB only; Service → Repository + external APIs; Controller → Service only
- **No hand-edits**: `packages/api-client/src/generated/` is auto-generated — never edit directly
- **DB split**: Table definitions in `packages/db-schema/`, client + migrations in `packages/db/`
- **Shared types**: `User` and common DTOs defined once in `@my/contract`, reused everywhere
- **Client validation**: Reuse the same Zod schemas from `@my/contract` in `react-hook-form` on the client
