# Course Hub

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

## Tunnels

Expose local apps to the internet with `cloudflared` (PWA, webhooks, mobile testing). Run each in its own terminal:

```bash
cloudflared tunnel --url http://localhost:7007   # API
```

```bash
cloudflared tunnel --url http://localhost:3000   # Web (PWA testing)
```

The URL is public and HTTPS; it changes on every restart. Notes:

- **PWA testing**: a PWA needs HTTPS + a stable origin to install. Point the browser at the web tunnel URL; service workers/push work over it.
- **API**: for webhooks (e.g. Cloudflare Stream), register the API tunnel URL and update the webhook whenever it changes (see below).

### Current tunnels

#### API

```bash
https://satin-educational-pearl-del.trycloudflare.com
```

#### Web

```bash
https://appear-den-elvis-solar.trycloudflare.com
```

## Cloudflare Stream webhook (video processing)

Video status (uploading → processing → ready/error) is pushed to the API via a Cloudflare Stream webhook at `POST /api/v1/videos/webhook`. In local dev the API isn't publicly reachable, so expose it first:

Copy the `https://<random>.trycloudflare.com` URL from the output, then register it as the account-level webhook and retrieve the signing secret:

```bash
curl -X PUT --header 'Authorization: Bearer <API_TOKEN>' \
  https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/webhook \
  --data '{"notificationUrl":"https://<random>.trycloudflare.com/api/v1/public/videos/webhook"}'
```

Set these in `apps/api/.env.local` (see `.env.example`):

- `CLOUDFLARE_ACCOUNT_ID` — the `<ACCOUNT_ID>` from the URL above
- `CLOUDFLARE_STREAM_API_TOKEN` — the `<API_TOKEN>` from above
- `CLOUDFLARE_STREAM_WEBHOOK_SECRET` — the `result.secret` returned by the PUT response
- `CLOUDFLARE_STREAM_CUSTOMER_CODE` — your Cloudflare Stream customer code

> The tunnel URL is regenerated on every `cloudflared tunnel` run, so re-run the PUT with the new URL whenever you restart the tunnel. Re-PUTting also returns a new secret — update `CLOUDFLARE_STREAM_WEBHOOK_SECRET` accordingly.

## Scripts

```bash
# Build & quality
pnpm build
pnpm lint
pnpm typecheck
pnpm format

# API client (run after any route/schema change)
pnpm api-client:generate

# Database
pnpm db:generate       # Generate Drizzle migration files
pnpm db:push           # Push schema to DB (dev)
pnpm db:migrate        # Run pending migrations
pnpm db:studio         # Drizzle Studio UI
```

## Dev Guide

See [AGENTS.md](./AGENTS.md) for conventions, non-obvious patterns, and the full step-by-step guide for adding new features.
