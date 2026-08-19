# Aura Monorepo

A full-stack monorepo for building web and mobile applications. Provides a ready-to-use foundation with a REST API, Next.js web app, Expo mobile app, shared UI components, type-safe database access, and auto-generated API clients.

## Tech stack

| Layer        | Tech                                                        |
| ------------ | ----------------------------------------------------------- |
| Web          | Next.js 16 (App Router), React 19, Tailwind 4, shadcn/Radix |
| Mobile       | Expo 55, React Native 0.83, NativeWind, Expo Router         |
| API          | Express 5, Node ≥20, Pino, OpenAPI 3.0                      |
| DB           | PostgreSQL (Supabase), Drizzle ORM, drizzle-kit             |
| Auth         | Supabase Auth — cookie (web) / Bearer (native)              |
| Shared types | `@repo/contract` (Zod schemas, drizzle-zod derived)         |
| API client   | Orval → React Query + Axios (auto-generated)                |
| i18n         | i18next — Serbian (default), English                        |
| Build        | Turborepo, pnpm 10 workspaces                               |

## Project structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full directory tree, data-flow diagram, and key architectural decisions.

## How to run

## Prerequisites

Copy the example env files and fill in the required values (e.g. Supabase URL and keys).

```bash
## Install dependencies
pnpm install

## Generate API client (run after any route/schema change)
pnpm api-client:generate

## Initialize codegraph (AI code assistant) — optional but recommended
codegraph init
```

```bash
pnpm dev          # All apps in watch mode
pnpm web          # Web only (port 3000)
pnpm api          # API only
pnpm ios          # Expo iOS
```

## Scripts

```bash
# Build & quality
pnpm build
pnpm lint
pnpm check-types
pnpm format

# API client (run after any route/schema change)
pnpm api-client:generate

# Database
pnpm db:generate       # Generate Drizzle migration files
pnpm db:push           # Push schema to DB (dev)
pnpm db:migrate        # Run pending migrations
pnpm db:studio         # Drizzle Studio UI
pnpm db:seed:users     # Seed test users
pnpm db:clean:users    # Clear users table
```

## Dev Guide

See [AGENTS.md](./AGENTS.md) for conventions, non-obvious patterns, and the full step-by-step guide for adding new features.
