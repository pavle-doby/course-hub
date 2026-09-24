# Course Hub

A course authoring and learning platform. Creators can build public or private courses, organize topics and lessons, attach videos and documents, invite learners, and manage enrollments. Learners can explore public courses and use an enrolled course reader.

## Tech stack

| Layer        | Tech                                                        |
| ------------ | ----------------------------------------------------------- |
| Web          | Next.js 16 (App Router), React 19, Tailwind 4, shadcn/Radix |
| API          | Express 5, Node >=22, Pino, OpenAPI 3.1                     |
| DB           | PostgreSQL (Supabase), Drizzle ORM, drizzle-kit             |
| Auth         | Supabase Auth with access and refresh tokens                |
| Media        | Cloudflare Stream (video) and R2 (documents/thumbnails)     |
| Shared types | `@repo/contract` (Zod schemas, drizzle-zod derived)         |
| API client   | Orval -> React Query + Axios (auto-generated)               |
| i18n         | i18next — Serbian (default), English                        |
| Build        | Turborepo, pnpm workspaces                                  |

## Project structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full directory tree, data-flow diagram, and key architectural decisions.

## Product areas

- Course creation, publishing, visibility, thumbnails, topics, and lessons
- Public course catalog and enrolled-course reader
- Course enrollment, learner lists, and email or share-link invitations
- Cloudflare Stream videos and Cloudflare R2 documents at course, topic, or lesson level
- Profile, settings, and localized web UI
- AI access: an MCP server for AI agents, usable as a claude.ai connector (OAuth) or from Claude Code / Cursor with a personal access token

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
```

## Tunnels

Expose local apps to the internet with `cloudflared`, for example for webhook testing. Run each in its own terminal:

```bash
cloudflared tunnel --url http://localhost:7007   # API
```

```bash
cloudflared tunnel --url http://localhost:3000   # Web (PWA testing)
```

The URL is public and HTTPS, and changes on every restart. Register the API tunnel URL with Cloudflare Stream when testing webhooks locally.

## Claude connector (MCP)

The API serves an MCP server at `/apix/v1/mcp` (production: `https://api-production-e54c.up.railway.app/apix/v1/mcp`). Clients log in with OAuth or with a personal access token.

**claude.ai (web, desktop, mobile)**

1. Open [claude.ai/customize/connectors](https://claude.ai/customize/connectors) → **Add custom connector**.
2. Name it `Course Hub` and paste the MCP URL.
3. Click **Connect**, log in to Course Hub if asked, and click **Allow** on the consent page.

Each connection creates a token named after the client in Settings → AI access; revoke it there to disconnect.

**Claude Code**

```bash
# OAuth: opens the browser to log in on first use (/mcp → course-hub → Authenticate)
claude mcp add --transport http --scope user course-hub https://api-production-e54c.up.railway.app/apix/v1/mcp

# Or a personal access token from Settings → AI access (the dialog shows this command pre-filled)
claude mcp add --transport http --scope user course-hub https://api-production-e54c.up.railway.app/apix/v1/mcp \
  --header "Authorization: Bearer ch_pat_..."
```

**Local testing**

OAuth needs `API_PUBLIC_URL`, `WEB_APP_URL`, and `OAUTH_SECRET` in `apps/api/.env` (see `.env.example`). claude.ai calls the API from its servers, so expose the API with a [tunnel](#tunnels) and set `API_PUBLIC_URL` to the tunnel URL. The consent page opens in your own browser, so `WEB_APP_URL` can stay `http://localhost:3000`. Then add `<tunnel-url>/apix/v1/mcp` as the connector URL.

## Deploy API to Railway

See [README.deploy.md](./README.deploy.md) for the manual Railway settings, environment variables, API URL, CORS, and webhook flow for both services.

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

Course thumbnails and attached documents use R2. Configure the `CLOUDFLARE_R2_*` variables in [`apps/api/.env.example`](./apps/api/.env.example) to enable uploads.

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
