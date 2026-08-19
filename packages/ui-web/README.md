# @repo/ui-web

Shared UI component library for the monorepo, built with [shadcn/ui](https://ui.shadcn.com/) and Tailwind CSS.

Primitive components (e.g. `button`, `input`, `label`, `card`) live here and are re-exported for all apps to consume.

## Adding shadcn components

Run the `add` command **from the `apps/web` directory** — the CLI will detect the monorepo setup and automatically install primitive components into this package.

```bash
cd apps/web
pnpm dlx shadcn@latest add [COMPONENT]
```

For example, `pnpm dlx shadcn@latest add button` installs the `Button` component under `packages/ui-web/src/components/`.

After adding a component, export it from `src/index.ts` if it isn't picked up automatically so other apps can import it via `@repo/ui-web`.

## Usage in apps

```tsx
import { Button } from "@repo/ui-web/components/button";
```
