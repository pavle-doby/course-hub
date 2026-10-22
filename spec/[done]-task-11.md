# Task 11: Forgot / Reset Password (web)

Scope: a user who forgot their password requests a reset link by email, opens it, and sets a new password. Supabase sends the email and owns the recovery token; the API wraps it in two public endpoints. Native is out of scope (it can reuse the same endpoints later).

Status legend: `[x]` done · `[ ]` todo · `[~]` needs the user (e.g. dashboard config).

## Decisions

- **No DB changes.** Supabase Auth stores and expires recovery tokens.
- **`token_hash` flow, verified by the API.** The default Supabase link redirects with tokens in the URL `#fragment`, which the server never sees. Instead the email template links straight to the web app with `?token_hash=…&type=recovery`, and `POST /v1/auth/reset-password` calls `verifyOtp` with it.
- **Per-request Supabase client for reset.** `verifyOtp` stores a session on the client it runs on; the shared singleton in `api/utils/supabase.ts` would leak that session across concurrent requests. `resetPassword` builds a throwaway client (`persistSession: false`, `autoRefreshToken: false`).
- **No account enumeration.** `forgot-password` always returns 200, even for unknown emails. Only a Supabase 429 surfaces (as `RATE_LIMIT_EXCEEDED`).
- **Other sessions are signed out** after a successful reset (`signOut({ scope: "others" })`, best effort).
- **Two new error codes:** `ErrorCodeAuth.RESET_LINK_INVALID` (expired/used/bad token) and `ErrorCodeAuth.SAME_PASSWORD`.
- **After reset the user logs in again.** The endpoint returns no tokens; the web page shows a success state with a link to `/auth/login`.

## Supported Flows

| Trigger                               | Effect                                                             |
| ------------------------------------- | ------------------------------------------------------------------ |
| Login → "Forgot your password? Reset" | `/auth/forgot`                                                     |
| Submit email on `/auth/forgot`        | `POST /v1/auth/forgot-password`; "check your inbox" state (always) |
| Click link in email                   | `/auth/reset?token_hash=…&type=recovery`                           |
| Submit new password + confirm         | `POST /v1/auth/reset-password`; success state → link to login      |
| Link missing `token_hash`             | Invalid-link state with link back to `/auth/forgot`                |
| Expired / used link                   | `RESET_LINK_INVALID` alert + "request a new link" link             |
| Same password as before               | `SAME_PASSWORD` alert                                              |

## Steps

### 0. Supabase dashboard (user)

- [x] Auth → Email Templates → **Reset Password**: set the link to `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery`.
- [x] Auth → URL Configuration → Redirect URLs: add `http://localhost:3000/auth/reset` and the production `<WEB_APP_URL>/auth/reset`.
- [x] Production: configure custom SMTP (built-in sender is limited to a few emails per hour).

### 1. Contract — `packages/contract/src/auth/`

- [x] `AuthForgotPasswordQuerySchema` (`email`), `AuthResetPasswordQuerySchema` (`tokenHash`, `password` min 6).
- [x] `AuthForgotPasswordReq`, `AuthResetPasswordReq` types.
- [x] `ErrorCodeAuth.RESET_LINK_INVALID`, `ErrorCodeAuth.SAME_PASSWORD`.

### 2. Error messages

- [x] `packages/shared/src/consts/authErrorMessages.ts` entries.
- [x] `errors.auth.RESET_LINK_INVALID` / `SAME_PASSWORD` in `en` and `sr` `common.ts`.

### 3. API — `apps/api/src/modules/auth/`

- [x] `authService.forgotPassword` → `resetPasswordForEmail(email, { redirectTo: \`${WEB_APP_URL}/auth/reset\` })`.
- [x] `authService.resetPassword` → per-request client, `verifyOtp({ type: "recovery", token_hash })`, `updateUser({ password })`, `signOut({ scope: "others" })`.
- [x] Controller + `POST /v1/auth/forgot-password`, `POST /v1/auth/reset-password` (public, `validate`).
- [x] OpenAPI: `authForgotPassword`, `authResetPassword`.

### 4. API client

- [x] `pnpm api-client:generate` → `useAuthForgotPassword`, `useAuthResetPassword`.

### 5. Web — `apps/web/app/auth/[mode]/`

- [x] `forgot-form.tsx` wired (react-hook-form + zod, `useErrorHandlingForm`, i18n, success state).
- [x] `"reset"` mode in `page.tsx` + `components/reset-form.tsx` (password + confirm, show/hide, invalid-link and success states).
- [x] `auth.forgot.*` / `auth.reset.*` keys in `en` and `sr`.

### 6. Docs + verification

- [x] `FEATURES.md` and `spec/task-init.md` updated.
- [x] `pnpm --filter api build`, `pnpm typecheck`, `pnpm lint`.
- [x] Manual: forgot → email → link → reset → login with new password; expired/reused link; same password; unknown email still shows success.
