# Architecture

High-level map of the `course-hub`. Each node is a workspace package or app; arrows indicate major dependency directions (consumers → providers).

```
course-hub/                       # pnpm + Turborepo monorepo
│
├── apps/                         # Deployable applications
│   ├── api/                      # REST API (Express 5, Node >=22)
│   │   ├── src/modules/          #   auth, users, courses, topics, lessons, enrollments,
│   │   │                         #   invitations, videos, documents, notifications, progress,
│   │   │                         #   api-tokens, ai, health
│   │   ├── src/middleware/       #   Auth (JWT + personal access tokens), error handling
│   │   ├── src/routes/           #   /api (private + public /v1) and /apix (external systems)
│   │   ├── src/openapi/          #   Auto-generates openapi.json from code
│   │   └── openapi.json          #   OpenAPI 3.1 spec (committed, consumed by Orval)
│   │
│   ├── web/                      # Next.js 16 web app (React 19, App Router)
│   │   └── app/                  #   Pages and layouts
│   │
│   ├── native/                   # Expo SDK 57 iOS/Android app (in progress, Expo Router)
│   │   └── src/app/              #   Screens and layouts
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
│   ├── ui-theme/                 # Design tokens (colors, radius) shared by web and native
│   │   ├── src/web/index.css     #   Web CSS entry (Tailwind 4 variables)
│   │   └── src/native/           #   THEME tokens, NAV_THEME, NativeWind Tailwind preset
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
│   └── ui-native/                # React Native components for apps/native (NativeWind v4)
```

### API module organization

Each feature in `apps/api/src/modules/` follows the same layout:

```
<feature>/
├── routes/        # Express routers and middleware chain
├── controllers/   # Read res.locals, call service, send response
├── services/      # Business logic, typed errors
├── repository/    # Drizzle queries only
├── openapi/       # OpenAPI path registrations
└── ai/tools/      # (optional) AI course tools for this feature
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
│                                    ▼               ▼             │
│                                   web         other apps         │
└──────────────────────────────────────────────────────────────────┘
```

## Key Decisions

| Decision         | Choice                                                | Why                                                                |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| API style        | REST + OpenAPI                                        | Enables Orval code-gen; type-safe across all clients               |
| Auth             | Supabase Auth (JWT)                                   | API client supplies and refreshes bearer tokens                    |
| DB               | Drizzle ORM + PostgreSQL via Supabase                 | Type-safe SQL-first; schema-to-Zod via drizzle-zod                 |
| Schema ownership | `db-schema` → `contract`                              | Single source of truth; prevents drift between DB and validation   |
| API client       | Orval (code-gen)                                      | `src/generated/` is always in sync with `openapi.json`             |
| Media            | Cloudflare Stream + R2                                | Video processing and object storage for course media               |
| Styling          | Tailwind 4 (web), NativeWind v4 / Tailwind 3 (native) | Tokens shared via `ui-theme`; components in `ui-web` / `ui-native` |
| i18n             | i18next                                               | Serbian default and English secondary                              |
| Build            | Turborepo                                             | Remote caching, task graph, watch mode across all packages         |
| AI tools         | Typed tools per feature module + MCP                  | One tool layer shared by MCP (`/apix/v1/mcp`) and the course chat  |
