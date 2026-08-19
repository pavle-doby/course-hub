---
description: "Use when adding or editing screens, navigation, components, hooks, providers, or styles in apps/native. Covers Expo Router file conventions, component placement, NativeWind theming, API call patterns, i18n, and import aliases."
applyTo: "apps/native/**"
---

# Native App Conventions (`apps/native`)

Expo 55, React Native 0.83, Expo Router, NativeWind 4. The app is intentionally thin — reusable UI lives in `@repo/ui-native`, design tokens in `@repo/ui-theme`.

## Component placement

| Type                                       | Location                                   | Import alias                        |
| ------------------------------------------ | ------------------------------------------ | ----------------------------------- |
| Shared primitive / ui-native components    | `packages/ui-native/src/components/`       | `@repo/ui-native/components/<name>` |
| App-specific composed screens / components | `apps/native/components/`                  | `@/components/<name>`               |
| App-specific hooks                         | `apps/native/lib/` or `apps/native/hooks/` | `@/lib/<name>` / `@/hooks/<name>`   |
| Theme re-exports                           | `apps/native/lib/theme.ts`                 | `@/lib/theme`                       |
| `cn()` utility                             | `apps/native/lib/utils.ts`                 | `@/lib/utils`                       |

Never define reusable primitive components inline in the app — add them to `@repo/ui-native`.

```tsx
// ✅ correct
import { Button } from "@repo/ui-native/components/button";
import { ProfileCard } from "@/components/profile-card";

// ❌ wrong — reusable component defined inline in a screen
function Button({ children }: { children: React.ReactNode }) { ... }
```

## Routing — Expo Router file conventions

Screens live in `apps/native/app/`. Expo Router uses file-based routing:

| File                     | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| `app/_layout.tsx`        | Root layout — providers, `<Stack />`, `<PortalHost />` |
| `app/index.tsx`          | Default route (`/`)                                    |
| `app/+not-found.tsx`     | 404 fallback                                           |
| `app/+html.tsx`          | Web-only HTML shell (do not edit for native logic)     |
| `app/(tabs)/_layout.tsx` | Tab navigator layout (route group, no URL segment)     |
| `app/(auth)/login.tsx`   | Auth screen under a route group                        |

Use **route groups** `(group)/` to share layouts without adding a URL segment.

```tsx
// Root layout — minimal, just providers + navigator
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack />
      <PortalHost />
    </ThemeProvider>
  );
}
```

## Theming — NativeWind + CSS variables

Color scheme is read with `useColorScheme()` from `nativewind`. The React Navigation `ThemeProvider` receives `NAV_THEME` (imported from `@/lib/theme`, sourced from `@repo/ui-theme/native`).

```tsx
import { useColorScheme } from "nativewind";
import { NAV_THEME } from "@/lib/theme";

const { colorScheme, toggleColorScheme } = useColorScheme();
// Pass NAV_THEME[colorScheme ?? "light"] to ThemeProvider
```

For styling, use NativeWind utility classes with CSS variable tokens (`bg-background`, `text-foreground`, `border-border`). Never hardcode colours.

```tsx
import { cn } from "@/lib/utils";

// ✅ correct — CSS variable tokens
<View className={cn("flex-1 bg-background px-4")} />

// ❌ wrong — hardcoded colour
<View style={{ backgroundColor: "#ffffff" }} />
```

Use `Platform.select()` for web-only pseudo-classes (hover, focus-visible) — see `packages/ui-native` instructions for the full pattern.

## Icons

Use `lucide-react-native` only (not `lucide-react`). Size with NativeWind (`className="size-4"`). Use the shared `Icon` component from `@repo/ui-native/components/icon` which applies `cssInterop` automatically.

```tsx
import { Icon } from "@repo/ui-native/components/icon";
import { SunIcon } from "lucide-react-native";

<Icon as={SunIcon} className="size-5 text-foreground" />;
```

## API calls — use generated hooks inside a QueryClientProvider

Wrap the app (in `_layout.tsx`) with `ApiClientProvider` from `@repo/api-client`, then use Orval-generated React Query hooks. Never use raw `fetch` or `axios` in screens.

```tsx
// _layout.tsx
import { ApiClientProvider } from "@repo/api-client";

<ApiClientProvider>
  <Stack />
</ApiClientProvider>;

// Screen
import { useGetUserSelf } from "@repo/api-client";

const { data, isPending } = useGetUserSelf();
```

If a hook doesn't exist yet, add the route to `apps/api`, then run `pnpm api-client:generate`.

## i18n — useT hook from @repo/i18n

Use `useT(namespace)` from `@repo/i18n` in all screens. Wrap the app with `I18nProvider` in `_layout.tsx`. Never hardcode user-visible strings.

```tsx
// _layout.tsx
import { I18nProvider } from "@repo/i18n";

<I18nProvider>
  <Stack />
</I18nProvider>;

// Screen
import { useT } from "@repo/i18n";

const { t } = useT("home");
return <Text>{t("title")}</Text>;
```

## Navigation patterns

Use `useRouter()` or `<Link>` from `expo-router` for navigation. Use `Stack.Screen` options for per-screen header config.

```tsx
import { useRouter, Link, Stack } from "expo-router";

// Programmatic navigation
const router = useRouter();
router.push("/profile");

// Declarative link
<Link href="/settings">Settings</Link>

// Per-screen header options (in the screen file)
<Stack.Screen options={{ title: "Profile", headerShown: true }} />
```

## Import aliases

| Alias               | Resolves to                |
| ------------------- | -------------------------- |
| `@/*`               | `apps/native/*`            |
| `@repo/ui-native/*` | `packages/ui-native/src/*` |
| `@repo/ui-theme/*`  | `packages/ui-theme/src/*`  |
| `@repo/api-client`  | `packages/api-client/src`  |
| `@repo/i18n`        | `packages/i18n/src`        |
| `@repo/contract`    | `packages/contract/src`    |

Never use relative paths (`../../`) to cross package boundaries.

## Adding a new screen

1. Create `apps/native/app/<route>.tsx` (or `app/<group>/<route>.tsx`).
2. Import components from `@repo/ui-native` for primitives, `@/components` for composed local UI.
3. Use `useT()` for all visible strings.
4. If the screen needs data, use the appropriate Orval hook from `@repo/api-client`.
5. Customise the header via `<Stack.Screen options={{ ... }} />` at the top of the component.

## Root layout provider order

Providers in `_layout.tsx` should nest in this order:

```tsx
<I18nProvider>         // @repo/i18n — i18next context
  <ApiClientProvider>  // @repo/api-client — React Query client
    <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
      <StatusBar ... />
      <Stack />
      <PortalHost />   // @rn-primitives/portal — for modals/popovers
    </ThemeProvider>
  </ApiClientProvider>
</I18nProvider>
```
