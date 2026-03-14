# Course Hub

Course Hub is a platform that allows users to create, share, and enroll in courses.

## TODO

- [ ] Add husky for pre-commit linting and formatting
- [ ] Add tamagui for UI components
- [ ] Go go go

## Tech Stack

### Web

- Next.js
- TanStack Query (for data fetching - auto-generated from OpenAPI spec)

### API

- Express.js
- Zod for validation
- OpenAPI for API contract

### Database

- Supabase (PostgreSQL)
- Drizzle ORM

## Monorepo structure

The project is organized as a Turborepo monorepo using pnpm workspaces, with the following structure:

```
course-hub/
├── apps/
│   ├── api/          # Express API server
│   ├── docs/         # Docs site (Next.js)
│   └── web/          # Frontend (Next.js)
├── packages/
│   ├── api-client/   # Auto-generated TanStack Query hooks (Orval)
│   ├── contract/     # Shared API contract types
│   ├── db/           # Drizzle ORM client & migrations
│   ├── db-schema/    # Shared DB schema definitions
│   ├── eslint-config/# Shared ESLint configs
│   ├── scripts/      # DB seed/clean scripts
│   ├── typescript-config/ # Shared tsconfig bases
│   └── ui/           # Shared React component library
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── turbo.json
```

## Auto generated TanStack Query hooks

TanStack Query hooks for the API are fully auto-generated — no manual hook writing required.

### How it works

1. **`apps/api`** uses [`@asteasolutions/zod-to-openapi`](https://github.com/asteasolutions/zod-to-openapi) to build an OpenAPI 3.1 spec from the existing Zod validation schemas. Each module registers its own routes:
   - `src/modules/auth/openapi/paths/auth.ts`
   - `src/modules/users/openapi/paths/users.ts`

   The spec is assembled in `src/openapi/spec.ts` and written to `apps/api/openapi.json`.

2. **`packages/api-client`** uses [Orval](https://orval.dev) to read `openapi.json` and emit fully-typed TanStack Query v5 hooks into `src/generated/`. An Axios instance (`src/lib/apiClient.ts`) is used as the mutator, configured with `withCredentials: true` for cookie-based auth.

3. **`apps/web`** (and any other app) imports hooks directly from `@repo/api-client`.

### Generating

```bash
# Full pipeline from the root (spec → hooks)
pnpm generate

# Or step by step:
pnpm --filter api generate:openapi          # writes apps/api/openapi.json
pnpm --filter @repo/api-client generate:api  # writes packages/api-client/src/generated/
```

> The generated files (`openapi.json` and `src/generated/`) are gitignored and must be regenerated after any API route or schema change.

### Usage in web

```tsx
import { useGetV1UsersSelf, usePostV1AuthLogin } from "@repo/api-client";

function Profile() {
  const { data: user } = useGetV1UsersSelf();
  // ...
}
```
