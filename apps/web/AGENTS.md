# Web App Conventions (`apps/web`)

Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn (radix-nova style). The app is intentionally thin — logic and reusable UI live in monorepo packages.

## Component placement

| Type                                  | Location                           | Import alias                      |
| ------------------------------------- | ---------------------------------- | --------------------------------- |
| Primitive / shadcn UI                 | `packages/ui-web/src/components/`  | `@repo/ui-web/components/<name>`  |
| Component used by a single route only | `apps/web/app/<route>/components/` | `@/app/<route>/components/<name>` |
| Component shared by multiple routes   | `apps/web/components/`             | `@/components/<name>`             |
| App-specific hooks                    | `apps/web/hooks/`                  | `@/hooks/<name>`                  |
| App-specific providers                | `apps/web/providers/`              | `@/providers/<name>`              |

Never define reusable primitives inline in the web app — add them to `@repo/ui-web`.

Colocate a component under its route's `components/` folder if it's only used by that route. Only promote it to `apps/web/components/` once a second route needs it.

## Utilities

- Place each utility function in its own file under `apps/web/utils/`.
- Keep multiple constant values together in `apps/web/utils/consts.ts`.

```tsx
// ✅ correct
import { Button } from "@repo/ui-web/components/button";
import { LoginForm } from "@/components/login-form";

// ❌ wrong — primitive defined locally
function Button({ children }: { children: React.ReactNode }) { ... }
```

## Server vs Client components

App Router defaults to **server components** — only add `"use client"` when the component needs browser APIs, event handlers, or React hooks.

```tsx
// Server component — async is fine, no directive needed
export default async function ProfilePage() {
  const t = await getT("profile");
  return <h1>{t("title")}</h1>;
}

// Client component — needed for hooks / interactivity
("use client");
export function ProfileCard() {
  const { data } = useGetUserSelf();
  return <div>{data?.name}</div>;
}
```

## API calls — always via generated hooks

Use **only** the Orval-generated React Query hooks from `@repo/api-client`. Never use raw `fetch` or `axios` in the web app.

```tsx
// ✅ correct
import { useGetUserSelf, useUpdateUser } from "@repo/api-client";

const { data, isPending } = useGetUserSelf();
const { mutate } = useUpdateUser();

// ❌ wrong
const res = await fetch("/api/users/self");
```

If a hook doesn't exist yet, add the route to `apps/api`, then run `pnpm api-client:generate`.

## i18n

- **Server components:** `initServerI18next()` in the root layout initialises i18next; use `await getT(namespace)` to get a translator.
- **Client components:** Use the `useT(namespace)` hook from `@repo/i18n/client`.

```tsx
// Server
import { initServerI18next, getT } from "@repo/i18n/server";
await initServerI18next();
const t = await getT("common");

// Client
import { useT } from "@repo/i18n/client";
const { t } = useT("common");
```

Never import i18n server utilities in client components or vice versa.

## Styling

Use Tailwind utility classes and `cn()` from `@repo/ui-web/lib/utils` to conditionally merge them. Design tokens come from `@repo/ui-theme` via CSS variables — never hardcode colours or spacing.

## Mobile Components

### Responsive breakpoint — mobile vs desktop split is `md`, not `lg`

The mobile/desktop cutoff is the **tablet** breakpoint (`md`, 768px), not `lg`. Below `md` shows the mobile view (bottom nav, `Sheet`/`Drawer` offcanvas, stacked layout); `md` and above shows the desktop/tablet view (sidebar, grid layouts). Use `sm:`/`md:` prefixes for responsive layout — do not introduce new `lg:` breakpoints for mobile-vs-desktop switches (`lg:` is still fine as a component size variant, e.g. `size="lg"`, unrelated to breakpoints). `useIsMobile()` (`@repo/ui-web/hooks/use-mobile`) already matches this at `MOBILE_BREAKPOINT = 768`.

```tsx
// ✅ correct — tablet (md) and up is "desktop" view
<div className="hidden md:flex" />
<nav className="fixed inset-x-0 bottom-0 md:hidden" />

// ❌ wrong — lg leaves tablet widths stuck on the mobile layout
<div className="hidden lg:flex" />
```

```tsx
import { cn } from "@repo/ui-web/lib/utils";

// ✅ correct — CSS variable tokens
<div className={cn("bg-background text-foreground border-border", className)} />

// ❌ wrong — hardcoded colour
<div className="bg-white text-gray-900" />
```

### Mobile bottom drawer actions — `gap-3` and `pb-16`

When a mobile bottom `Drawer` renders a list of actions (e.g. card action menus, nav link lists), the action items must be spaced with `gap-3` and have 64px bottom padding (`pb-16`) on the scrollable `<div>` that holds them. Never stack bare action buttons/links without vertical spacing.

Every bottom drawer must include a visible `DrawerHeader` with a `DrawerTitle` before its action list.

```tsx
// ✅ correct — spaced action list
<DrawerHeader className="border-b text-left">
  <DrawerTitle>Actions</DrawerTitle>
</DrawerHeader>
<div className="flex flex-col gap-3 p-2 pb-16">
  {actions.map((action) => (
    <DrawerClose key={action.key} asChild>
      <Button className="w-full justify-start gap-2" {...action.props} />
    </DrawerClose>
  ))}
</div>

// ❌ wrong — actions touching each other
<div className="flex flex-col p-2 pb-16">...</div>
```

Dispatch rule: this is a **web-app convention** (how `Drawer` is used). The `@repo/ui-web` `Drawer` primitive itself stays spacing-agnostic.

### Bottom navigation height — `h-20`

Every mobile bottom navigation component must use `ChBottomNav` from `@/components/ch-bottom-nav` as its outer container. `ChBottomNav` owns the shared `h-20` height, mobile visibility, border, background, and default fixed positioning. Pass only route-specific layout or positioning classes through `className`.

Use `Button` from `@repo/ui-web/components/button` for actions. Use `Link` only when the control navigates to a route.

```tsx
// ✅ correct
<ChBottomNav className="sticky inset-x-auto flex items-center justify-between px-4" />

// ❌ wrong — duplicates the shared mobile footer shell
<nav className="fixed inset-x-0 bottom-0 h-20 md:hidden" />
```

## Icons

Use `lucide-react` only. Size with Tailwind (`size-4`, `size-5`).

```tsx
import { ChevronDown } from "lucide-react";
<ChevronDown className="size-4" />;
```

## Images

Use `Image` from `next/image` instead of raw `<img>` elements.

## Adding a new page

1. Create `apps/web/app/<route>/page.tsx` (server component by default).
2. Add a layout if the route group needs shared UI: `apps/web/app/<route>/layout.tsx`.
3. Add `"use client"` only if the page itself needs hooks.
4. Use route groups `(group)/` to share layouts without affecting the URL.

## Providers

The three root providers are already wired in `app/layout.tsx` — do not duplicate them:

| Provider            | Source                       | Purpose            |
| ------------------- | ---------------------------- | ------------------ |
| `I18nProvider`      | `@repo/i18n/client`          | i18next context    |
| `ApiClientProvider` | `@repo/api-client`           | React Query client |
| `ThemeProvider`     | `@/providers/theme-provider` | dark/light mode    |

Add new providers by wrapping inside the existing provider tree in `layout.tsx`.

## Import aliases

| Alias              | Resolves to               |
| ------------------ | ------------------------- |
| `@/*`              | `apps/web/*`              |
| `@repo/ui-web/*`   | `packages/ui-web/src/*`   |
| `@repo/api-client` | `packages/api-client/src` |
| `@repo/i18n/*`     | `packages/i18n/src/*`     |
| `@repo/contract`   | `packages/contract/src`   |

Never use relative paths (`../../`) to cross package boundaries.

## shadcn CLI

When running `npx shadcn add <component>` from `apps/web`:

- **Primitive components** are installed into `packages/ui-web/src/components/` (configured via `aliases.ui`).
- **Composed/block components** (e.g., `login-form`) are installed into `apps/web/components/` (configured via `aliases.components`).
