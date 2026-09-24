# Railway Deployment

Deploy the web app and API as separate Railway services from this repository.

> Railway configuration files in this repository are not applied reliably. Configure or update every setting below manually in the Railway service settings. Do not rely on a committed `railway.toml` or `railway.json`.

## API Service

Create a service from the repository with the repository root as its root directory. Set these values in **Settings -> Build**:

| Setting        | Value                              |
| -------------- | ---------------------------------- |
| `buildCommand` | `pnpm turbo build --filter=api...` |
| `startCommand` | `pnpm --filter api start`          |

Set **Watch Patterns** to:

```text
/apps/api/**
/packages/contract/**
/packages/db/**
```

Railway provides `PORT`; do not set `SERVER_PORT` for this service.

Add the variables from [`apps/api/.env.example`](./apps/api/.env.example) in **Variables**.

Generate a public API domain after the first deploy. API routes are served under `/api`, so its web-facing base URL is:

```text
https://<api-domain>/api
```

## Web Service

Create a second service from the same repository, also with the repository root as its root directory. Set these values in **Settings -> Build**:

| Setting        | Value                              |
| -------------- | ---------------------------------- |
| `buildCommand` | `pnpm turbo build --filter=web...` |
| `startCommand` | `pnpm --filter web start`          |

Set **Watch Patterns** to:

```text
/apps/web/**
/packages/ui-web/**
/packages/contract/**
/packages/api-client/**
/packages/i18n/**
```

Add the variables from [`apps/web/.env.example`](./apps/web/.env.example) in **Variables** before deploying.

`NEXT_PUBLIC_API_URL` is embedded in the Next.js browser bundle during `buildCommand`. Redeploy the web service after changing it.

## Environment, API URL, and CORS Flow

1. Deploy the API service and generate its Railway public domain.
2. Set the web service's `NEXT_PUBLIC_API_URL` to `https://<api-domain>/api`, then deploy the web service.
3. Generate the web service's public domain.
4. Set the API service's `CORS_ENABLED_URL` to the exact web origin, for example `https://<web-domain>`, then redeploy the API service.
5. If either public domain changes, repeat steps 2 and 4.

`CORS_ENABLED_URL` is a comma-separated allowlist. Use origins only: no path, trailing slash, or whitespace.

```text
CORS_ENABLED_URL=https://app.example.com,https://staging-app.example.com
```

The API's CORS middleware reads this variable at startup. Add every browser origin that calls the API, including Railway preview or custom domains when applicable.

## Webhook URL

When Cloudflare Stream is enabled, configure its webhook URL as:

```text
https://<api-domain>/api/v1/public/videos/webhook
```

## MCP URL

The MCP server for coding agents is served by the API service under `/apix` (routes used by external systems) and needs no extra env vars:

```text
https://<api-domain>/apix/v1/mcp
```

Agents authenticate with a personal access token created in Settings → AI access.
