---
description: "Use when adding or editing web UI components, hooks, or styles in packages/ui-web. Covers shadcn/radix-nova components, cva variant patterns, cn utility, Tailwind CSS variables, and how to add new components."
applyTo: "packages/ui-web/**"
---

# UI Package Conventions (`@repo/ui-web`)

`@repo/ui-web` is the shared web component library built on shadcn (radix-nova style), Radix UI primitives, Tailwind CSS 4, and `class-variance-authority`. All web UI components live here — never define reusable components inline in `apps/web`.

## Folder structure

```
src/
├── components/   # One file per component (e.g. button.tsx)
├── hooks/        # Shared React hooks
├── lib/
│   └── utils.ts  # cn() helper — clsx + tailwind-merge
└── styles/
    └── globals.css  # Tailwind entry — imports ui-theme/web
```

## Adding a new component

1. Create `src/components/<name>.tsx`.
2. Use `cva` for variants. Import `cn` from `@repo/ui-web/lib/utils`.
3. Export via named export (no default exports).

## Component pattern — cva + Radix Slot

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@repo/ui-web/lib/utils";

const myVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", outline: "..." },
    size: { default: "...", sm: "...", lg: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
});

function MyComponent({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof myVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";
  return <Comp className={cn(myVariants({ variant, size }), className)} {...props} />;
}

export { MyComponent };
```

## Design tokens — always use CSS variables

Design tokens come from `@repo/ui-theme/web` (imported in `globals.css`). Use CSS variable utility classes (`bg-primary`, `text-foreground`, `border-border`, etc.) — never hardcode colours or spacing values.

```tsx
// ✅ correct — uses theme variable
<div className="bg-background text-foreground border-border" />

// ❌ wrong — hardcodes colour
<div className="bg-white text-gray-900" />
```

## Icons

Use `lucide-react`. Size classes via Tailwind (`size-4`, `size-5`). The default `[&_svg:not([class*='size-'])]:size-4` base class in button handles unsized SVGs automatically.

```tsx
import { ChevronDown } from "lucide-react";
<ChevronDown className="size-4" />;
```

## Dark mode

Use the `dark:` variant. The `dark` class is applied to a parent element — never rely on `prefers-color-scheme` media queries in component classes.

## shadcn CLI

When installing a new shadcn component, run the CLI from the **repo root** using the alias configured in `packages/ui-web/components.json`:

```bash
pnpx shadcn@latest add <component> --cwd packages/ui-web
```

Installed components land in `src/components/` automatically. Review them before committing — tweak to match project conventions.

## Exports

Consumers import components by path alias:

```ts
import { Button } from "@repo/ui-web/components/button";
import { cn } from "@repo/ui-web/lib/utils";
```

The `exports` field in `package.json` uses wildcard entries; no manual registration is needed for new files. Verify `packages/ui-web/package.json` exports cover the new path.
