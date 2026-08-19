# web

Next.js web application for the monorepo.

## Development

```bash
pnpm dev       # start dev server
pnpm build     # production build
pnpm typecheck # type-check without emitting
pnpm lint      # lint
```

## Adding shadcn components

Run the `add` command from **this directory**. The CLI figures out where each file belongs and routes it to the right place automatically.

```bash
cd apps/web
pnpm dlx shadcn@latest add [COMPONENT]
```

**How the CLI splits files:**

| Component type                                     | Destination                   |
| -------------------------------------------------- | ----------------------------- |
| Primitives (`button`, `input`, `label`, `card`, …) | `packages/ui/src/components/` |
| Composed / block components (`login-form`, …)      | `apps/web/components/`        |

For example:

```bash
# Adds Button to packages/ui
pnpm dlx shadcn@latest add button

# Adds Button, Label, Input, Card to packages/ui
# and LoginForm to apps/web/components/
pnpm dlx shadcn@latest add login-01
```

Import primitives from `@repo/ui` and local composed components from `@/components`:

```tsx
import { Button } from "@repo/ui/components/button";
import { LoginForm } from "@/components/login-form";
```
