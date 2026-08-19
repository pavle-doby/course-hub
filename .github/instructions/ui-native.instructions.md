---
description: "Use when adding or editing React Native UI components, hooks, or styles in packages/ui-native. Covers NativeWind cva patterns, Platform.select for web fallbacks, TextClassContext, cssInterop for icons, and component exports."
applyTo: "packages/ui-native/**"
---

# UI Native Package Conventions (`@repo/ui-native`)

`@repo/ui-native` is the shared React Native component library built on NativeWind, `class-variance-authority`, and `@rn-primitives/slot`. All shared native UI components live here — never define reusable components inline in `apps/native`.

## Folder structure

```
src/
├── components/   # One file per component (e.g. button.tsx, text.tsx, icon.tsx)
├── hooks/        # Shared React Native hooks
└── lib/
    └── utils.ts  # cn() helper — clsx + tailwind-merge
```

## Component pattern — cva + NativeWind + Platform.select

Use `cva` for variants. Web-only CSS behaviours (hover, focus-visible, outline, whitespace, transitions) must be wrapped in `Platform.select({ web: '...' })` so they are never applied on iOS/Android.

```tsx
import { cn } from "../lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Platform, Pressable } from "react-native";

const myVariants = cva(
  cn(
    "base-native-classes",
    Platform.select({ web: "outline-none hover:bg-muted focus-visible:ring-2" })
  ),
  {
    variants: {
      variant: {
        default: cn(
          "bg-primary active:bg-primary/90",
          Platform.select({ web: "hover:bg-primary/90" })
        ),
      },
      size: {
        default: "h-10 px-4",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
```

Key differences from `@repo/ui-web` (web):

- Use `Pressable` / `Text` / `View` from `react-native`, not HTML elements.
- `active:` pseudo-class = native press feedback. `hover:` only applies on web.
- No `asChild` / Radix Slot — use `@rn-primitives/slot` (`Slot` from `'@rn-primitives/slot'`).

## Slot — use @rn-primitives, not radix-ui

```tsx
// ✅ correct
import { Slot } from "@rn-primitives/slot";

// ❌ wrong — radix-ui Slot is web-only
import { Slot } from "radix-ui";
```

## TextClassContext — propagate text colour to icons and nested text

`TextClassContext` is a React context that carries the current text Tailwind class down the tree. Consume it in components that need to inherit text color (e.g. icons inside buttons):

```tsx
import { TextClassContext } from "./text";

function Icon({ className, ...props }) {
  const textClass = React.useContext(TextClassContext);
  return <IconImpl className={cn("text-foreground", textClass, className)} {...props} />;
}
```

Provide it in container components (e.g. Button) to control icon colour for a specific variant.

## Icons — cssInterop + lucide-react-native

Use `lucide-react-native` (not `lucide-react`). Icons need `cssInterop` so NativeWind can drive `size` via `height`/`width` style props:

```tsx
import type { LucideIcon, LucideProps } from "lucide-react-native";
import { cssInterop } from "nativewind";

cssInterop(IconImpl, {
  className: {
    target: "style",
    nativeStyleToProp: { height: "size", width: "size" },
  },
});
```

Default icon size is `14`. Pass `className="size-4"` (NativeWind resolves to px) or explicit `size` prop.

## Design tokens — CSS variables via NativeWind

NativeWind resolves Tailwind utility classes to React Native styles using the theme defined in `@repo/ui-theme/native`. Use the same token class names as the web package (`bg-primary`, `text-foreground`, etc.) — never hardcode colours.

## Exports

Components, hooks, and lib utilities are exported via path aliases:

```ts
import { Button } from "@repo/ui-native/components/button";
import { Text } from "@repo/ui-native/components/text";
import { Icon } from "@repo/ui-native/components/icon";
import { cn } from "@repo/ui-native/lib/utils";
```

The `exports` field in `package.json` uses wildcard patterns (`"./components/*"`, `"./hooks/*"`, `"./lib/*"`). New files in those folders are automatically available without editing `package.json`.
