# API Client Package Conventions

`@repo/api-client` exposes the auto-generated React Query hooks (from Orval) plus a hand-written Axios instance that handles token authentication for the web PWA.

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

## Token providers

The web app configures token providers through `apps/web/providers/auth-token-provider.tsx`. Other token-authenticated clients must call `configureTokenProviders` at app startup before making API requests:

```ts
import { configureTokenProviders } from "@repo/api-client";

configureTokenProviders({
  getToken: async () => await SecureStore.getItemAsync("accessToken"),
  onRefresh: async () => {
    // call your refresh logic, return { accessToken, refreshToken } or null
  },
  onUnauthorized: () => {
    // clear local auth state and redirect to sign-in
  },
});
```

The request interceptor attaches `Authorization: Bearer <token>` when a token provider is configured. On a 401, the response interceptor calls `onRefresh` once and then invokes `onUnauthorized` if refreshing fails.

## Adding new exports

When Orval generates a new tag module, re-export it from `src/index.ts`:

```ts
export * from "./generated/<tag>/<tag>";
```

Never re-export anything from `src/generated/` directly in consuming apps — always go through `@repo/api-client`.

## Env vars

`src/env.ts` reads `process.env.NEXT_PUBLIC_API_URL`. Only `NEXT_PUBLIC_*` variables are inlined into the browser bundle — a bare `API_URL` is `undefined` in the browser. Declare any new env var there and add it to the web app's `.env.example`.

## Provider setup

Wrap the app root with `ApiClientProvider` (already a `QueryClientProvider`). Do not create additional `QueryClient` instances in apps.

```tsx
import { ApiClientProvider } from "@repo/api-client";

export default function RootLayout({ children }) {
  return <ApiClientProvider>{children}</ApiClientProvider>;
}
```
