---
description: "Use when working with packages/api-client — the Orval-generated React Query hooks, Axios client, token providers, or ApiClientProvider. Covers what is generated vs hand-written, the token/refresh flow, and how to extend the client."
applyTo: "packages/api-client/**"
---

# API Client Package Conventions

`@repo/api-client` exposes the auto-generated React Query hooks (from Orval) plus a hand-written Axios instance that handles auth for both web and native.

## Generated vs hand-written — never touch generated files

| Folder / File                 | Owned by                                      |
| ----------------------------- | --------------------------------------------- |
| `src/generated/`              | **Orval — never edit manually**               |
| `src/lib/apiClient.ts`        | Hand-written Axios instance + interceptors    |
| `src/api-client-provider.tsx` | Hand-written QueryClient provider             |
| `src/env.ts`                  | Env variable access                           |
| `src/index.ts`                | Public barrel — re-export what consumers need |

After any route or schema change in `apps/api`, regenerate with:

```bash
pnpm api-client:generate   # runs generate:openapi then orval
```

## Axios instance

All generated hooks call `customInstance` (the Orval mutator), which delegates to `apiClient` from `src/lib/apiClient.ts`. Never create a second Axios instance — always use `apiClient` from this file.

```ts
import { apiClient } from "@repo/api-client";
```

## Token flow — web vs native

Web uses HTTP-only cookies (`withCredentials: true`). No token management needed — cookies are attached automatically.

Native must call `configureTokenProviders` at app startup **before** any API request is made:

```ts
import { configureTokenProviders } from "@repo/api-client";

configureTokenProviders({
  getToken: async () => await SecureStore.getItemAsync("accessToken"),
  onRefresh: async () => {
    // call your refresh logic, return { accessToken, refreshToken } or null
  },
});
```

The `request` interceptor attaches `Authorization: Bearer <token>` only when a token provider is configured. The `response` interceptor retries on 401 — for native it calls `onRefresh`, for web it hits `/v1/auth/refresh` (cookie-based).

## Adding new exports

When Orval generates a new tag module, re-export it from `src/index.ts`:

```ts
export * from "./generated/<tag>/<tag>";
```

Never re-export anything from `src/generated/` directly in consuming apps — always go through `@repo/api-client`.

## Env vars

`src/env.ts` reads `process.env.API_URL`. Declare any new env var there and add it to `.env.example`.

## Provider setup

Wrap the app root with `ApiClientProvider` (already a `QueryClientProvider`). Do not create additional `QueryClient` instances in apps.

```tsx
import { ApiClientProvider } from "@repo/api-client";

export default function RootLayout({ children }) {
  return <ApiClientProvider>{children}</ApiClientProvider>;
}
```
