@AGENTS.md

# Claude Code Notes

AGENTS.md (imported above) and the scoped `AGENTS.md` files in `apps/` and `packages/` hold the coding rules. This file adds repo context that those files don't cover. Keep rules in AGENTS.md so OpenCode and Claude share them.

## Where to look first

| Question                                   | Source                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| Package map, data flow, key decisions      | [ARCHITECTURE.md](ARCHITECTURE.md)                                     |
| What's done vs. stubbed/in progress        | [FEATURES.md](FEATURES.md) (keep it updated when a feature changes)    |
| Specs for planned/ongoing work             | `spec/task-*` (e.g. `spec/task-6.2.md` = notification history)         |
| Deployment (Railway, two services)         | [README.deploy.md](README.deploy.md)                                   |
| Intentional shortcuts                      | `// ponytail:` comments mark deliberate simplifications; read before "fixing" |

## Verifying changes

- **There is no test suite.** Verify with `pnpm typecheck`, `pnpm lint`, and `pnpm build` (or filter: `pnpm turbo build --filter=api...` / `--filter=web...`, which is exactly what CI runs on `master`).
- `apps/api` has no `typecheck` or `lint` script; `pnpm --filter api build` (`tsc`) is its type check.
- Pre-commit runs `lint-staged` (eslint --fix + prettier) through Husky.

## End-to-end feature workflow

A full-stack feature touches the layers in this order (see FEATURES.md, "all layers"):

1. `packages/db-schema` table/enum/relation → ask the user to run `pnpm db:generate --name <name>` (never run it yourself).
2. `packages/contract/src/<feature>/` schemas, types, and `ErrorCode<Feature>` enum.
3. For each new error code: `packages/shared/src/consts/<feature>ErrorMessages.ts` + `errors.<feature>.*` keys in **both** `en` and `sr` locales.
4. `apps/api/src/modules/<feature>/`: repository → service → controller → routes → openapi. Mount in `src/routes/apiRoutes.ts` (private) or `apiPublicRoutes.ts` (public), and import the openapi file in `src/openapi/spec.ts`.
5. `pnpm api-client:generate` (regenerates `apps/api/openapi.json` then Orval hooks); re-export any new tag module from `packages/api-client/src/index.ts`.
6. Web UI in `apps/web/app/<route>/` with the generated hooks, plus `en`/`sr` translations.

## API request pipeline (`apps/api/src/server.ts`)

- Web-app routes are under `/api`. `apiPublicRoutes` mounts first with no auth; then `app.use("/api", handleAuth, apiRoutes)`, so **every private route already gets `handleAuth` at the mount**.
- `/apix` holds routes used by external systems (not the web app), outside `handleAuth`: `server.ts` only does `app.use("/apix", apixRoutes)`, and each mount in `src/routes/apixRoutes.ts` applies its own auth. Today only `/v1/mcp` (MCP for coding agents, personal access tokens via `handleTokenAuth`).
- `/api/v1/public/videos/webhook` receives the raw body (`handleRawBody`) before `express.json()` so Cloudflare Stream signatures can be checked (`validateWebhookSignature`). Keep new webhooks on the raw-body path.
- Other middleware: `validate`, `validateRole` (admin), `pagination`, `error` (typed errors → JSON). Logging uses Pino (`src/logger`).
- Inside the API, `api/*` is a path alias for `apps/api/src/*`.
- `apps/api/src/repositories/` and `apps/api/src/services/` are empty leftovers; code goes in `modules/<feature>/`.

## `@repo/shared` (no AGENTS.md of its own)

Client-side helpers used by the web app:

- `hooks/errors`: `useErrorHandlingForm`, `useErrorHandlingQuery`, `useErrorHandlingAction` map API `ErrorCode`s to localized messages.
- `hooks/i18n/useZodLocale` and `utils/zod/getZodLocale`: localized Zod errors.
- `consts/*ErrorMessages.ts`: per-feature `Record<ErrorCode…, {title, message}>` maps, combined in `allErrorMessages.ts`.

## Environment & local dev

- Env templates: `apps/api/.env.example` (Supabase, `DATABASE_URL`, Cloudflare Stream + R2, VAPID keys, CORS), `apps/web/.env.example` (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`), and `packages/db` / `packages/scripts` (`DATABASE_URL`). Add new vars to the matching `.env.example`.
- Ports: API `7007` (`SERVER_PORT`; Railway sets `PORT` instead), web `3000`. Web calls `http://localhost:7007/api`.
- Webhook testing locally: `cloudflared tunnel --url http://localhost:7007`.
- Web i18n routing runs through `apps/web/proxy.ts` (Next 16 "proxy", formerly middleware) using `createProxy` from `@repo/i18n/server`. Add new static assets to its matcher exclusions.
- Web push: the service worker is `apps/web/public/sw.js`, and client subscribe logic is in `apps/web/services/notifications-service.ts`.

## Gotchas

- `drizzle-zod@0.8.3` is patched (`patches/`, declared in `pnpm-workspace.yaml`). Account for the patch if you bump drizzle-zod.
- `@repo/ui-native` and the root `expo`/`react-native` deps are retained but unused; there is no native app. Don't build new features on them.
- `pnpm` 11 and Node >=22 are required (`packageManager` / `engines`).
