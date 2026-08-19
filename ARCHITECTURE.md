# Architecture

High-level map of the `aura-monorepo`. Each node is a workspace package or app; arrows indicate major dependency directions (consumers → providers).

```
aura-monorepo/                    # pnpm + Turborepo monorepo
│
├── apps/                         # Deployable applications
│   ├── api/                      # REST API (Express 5, Node ≥20)
│   │   ├── src/modules/          #   Feature modules: auth, users
│   │   ├── src/middleware/       #   Auth validation, error handling
│   │   ├── src/routes/           #   Express router (v1/auth, v1/users)
│   │   ├── src/openapi/          #   Auto-generates openapi.json from code
│   │   └── openapi.json          #   OpenAPI 3.0 spec (committed, consumed by Orval)
│   │
│   ├── web/                      # Next.js 16 web app (React 19, App Router)
│   │   └── app/                  #   Pages and layouts
│   │
│   ├── native/                   # Expo 55 / React Native 0.83 (iOS, Android)
│   │   └── app/                  #   Expo Router screens
│   │
│   └── docs/                     # Next.js 16 documentation site (port 3001)
│
├── packages/                     # Shared libraries (workspace:*)
│   │
│   ├── db-schema/                # Drizzle table + relation definitions (source of truth)
│   │   └── src/schemas/          #   users, enums, relations, file-uploads
│   │
│   ├── db/                       # Drizzle client, migrations, env validation
│   │   └── drizzle/              #   SQL migration files (drizzle-kit generated)
│   │
│   ├── contract/                 # Zod schemas + shared DTO types (drizzle-zod derived)
│   │   └── src/                  #   auth/, users/, shared/errors/
│   │
│   ├── api-client/               # Auto-generated React Query hooks (Orval)
│   │   ├── src/generated/        #   ⚠️ DO NOT EDIT — regenerate via pnpm api-client:generate
│   │   └── src/lib/apiClient.ts  #   Axios instance with auth (cookie/Bearer)
│   │
│   ├── ui/                       # Web component library (shadcn/Radix, Tailwind)
│   │   └── src/components/       #   Shared React components for Next.js apps
│   │
│   ├── ui-native/                # Mobile component library (NativeWind, Radix Primitives)
│   │   └── src/components/       #   Shared React Native components
│   │
│   ├── ui-theme/                 # Design tokens: Tailwind config, colors, animations
│   │   ├── index.css             #   Web CSS entry
│   │   └── native/               #   Mobile-specific tokens
│   │
│   ├── i18n/                     # i18next setup for web, native, and SSR
│   │   ├── src/locales/sr/       #   Serbian translations (default locale)
│   │   ├── src/locales/en/       #   English translations
│   │   ├── src/config.web.ts     #   Next.js config
│   │   └── src/config.native.ts  #   React Native config
│   │
│   ├── eslint-config/            # Shared ESLint rules (base, next, react-internal)
│   ├── typescript-config/        # Shared tsconfig presets (base, nextjs, react-library)
│   ├── scripts/                  # DB seed/clean scripts (run via pnpm db:*)
│   └── theme/                    # Tailwind CSS + tw-animate-css (legacy/alias)
│
└── ios/                          # Native iOS project (Xcode / CocoaPods)
    └── aura.xcworkspace/         #   Open this in Xcode, not .xcodeproj
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
│                                  web           native            │
└──────────────────────────────────────────────────────────────────┘
```

## Key Decisions

| Decision         | Choice                                | Why                                                              |
| ---------------- | ------------------------------------- | ---------------------------------------------------------------- |
| API style        | REST + OpenAPI                        | Enables Orval code-gen; type-safe across all clients             |
| Auth             | Supabase Auth (JWT)                   | Web: HTTP-only cookie; Native: Bearer header                     |
| DB               | Drizzle ORM + PostgreSQL via Supabase | Type-safe SQL-first; schema-to-Zod via drizzle-zod               |
| Schema ownership | `db-schema` → `contract`              | Single source of truth; prevents drift between DB and validation |
| API client       | Orval (code-gen)                      | `src/generated/` is always in sync with `openapi.json`           |
| Styling          | Tailwind 4 + NativeWind               | One token system (`ui-theme`) shared by web and mobile           |
| i18n             | i18next                               | Serbian default, English secondary; platform-specific configs    |
| Build            | Turborepo                             | Remote caching, task graph, watch mode across all packages       |
