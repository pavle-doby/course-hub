# Architecture

High-level map of the `course-hub`. Each node is a workspace package or app; arrows indicate major dependency directions (consumers → providers).

```
course-hub/                       # pnpm + Turborepo monorepo
│
├── apps/                         # Deployable applications
│   ├── api/                      # REST API (Express 5, Node >=22)
│   │   ├── src/modules/          #   auth, users, courses, topics, lessons,
│   │   │                        #   enrollments, invitations, videos, documents, health
│   │   ├── src/middleware/       #   Auth validation, error handling
│   │   ├── src/routes/           #   Private and public /v1 route aggregation
│   │   ├── src/openapi/          #   Auto-generates openapi.json from code
│   │   └── openapi.json          #   OpenAPI 3.1 spec (committed, consumed by Orval)
│   │
│   ├── web/                      # Next.js 16 web app (React 19, App Router)
│   │   └── app/                  #   Pages and layouts
│   │
│
├── packages/                     # Shared libraries (workspace:*)
│   │
│   ├── db-schema/                # Drizzle table + relation definitions (source of truth)
│   │   └── src/schemas/          #   users, courses, topics, lessons, enrollments,
│   │                              #   invitations, videos, documents, preferences
│   │
│   ├── db/                       # Drizzle client, migrations, env validation
│   │   └── drizzle/              #   SQL migration files (drizzle-kit generated)
│   │
│   ├── contract/                 # Zod schemas + shared DTO types (drizzle-zod derived)
│   │   └── src/                  #   Feature DTOs, validation schemas, typed errors
│   │
│   ├── api-client/               # Auto-generated React Query hooks (Orval)
│   │   ├── src/generated/        #   ⚠️ DO NOT EDIT — regenerate via pnpm api-client:generate
│   │   └── src/lib/apiClient.ts  #   Axios instance with auth (cookie/Bearer)
│   │
│   ├── ui-web/                   # Web component library (shadcn/Radix, Tailwind)
│   │   └── src/components/       #   Shared React components for Next.js apps
│   │
│   ├── ui-theme/                 # Design tokens: Tailwind config, colors, animations
│   │   └── index.css             #   Web CSS entry
│   │
│   ├── i18n/                     # i18next setup for web and SSR
│   │   ├── src/locales/sr/       #   Serbian translations (default locale)
│   │   ├── src/locales/en/       #   English translations
│   │   └── src/config.web.ts     #   Next.js config
│   │
│   ├── shared/                   # Shared React hooks and utilities
│   │
│   ├── eslint-config/            # Shared ESLint rules (base, next, react-internal)
│   ├── typescript-config/        # Shared tsconfig presets (base, nextjs, react-library)
│   ├── scripts/                  # DB seed/clean scripts (run via pnpm db:*)
│   └── ui-native/                # Retained React Native primitives (no native app)
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  db-schema  ──(drizzle-zod)──▶  contract  ──▶  api (validation)  │
│      │                               │                           │
│      ▼                               ▼                           │
│     db  ◀──── api (queries) ◀──── Supabase PostgreSQL            │
│                   │                                              │
│                   ▼                                              │
│            openapi.json  ──(Orval)──▶  api-client                │
│                                            │                     │
│                                    ┌───────┴───────┐             │
│                                    ▼                             │
│                                   web                             │
└──────────────────────────────────────────────────────────────────┘
```

## Key Decisions

| Decision         | Choice                                | Why                                                              |
| ---------------- | ------------------------------------- | ---------------------------------------------------------------- |
| API style        | REST + OpenAPI                        | Enables Orval code-gen; type-safe across all clients             |
| Auth             | Supabase Auth (JWT)                   | API client supplies and refreshes bearer tokens                  |
| DB               | Drizzle ORM + PostgreSQL via Supabase | Type-safe SQL-first; schema-to-Zod via drizzle-zod               |
| Schema ownership | `db-schema` → `contract`              | Single source of truth; prevents drift between DB and validation |
| API client       | Orval (code-gen)                      | `src/generated/` is always in sync with `openapi.json`           |
| Media            | Cloudflare Stream + R2                | Video processing and object storage for course media             |
| Styling          | Tailwind 4                            | Shared web tokens and components via `ui-theme` and `ui-web`     |
| i18n             | i18next                               | Serbian default and English secondary                            |
| Build            | Turborepo                             | Remote caching, task graph, watch mode across all packages       |
