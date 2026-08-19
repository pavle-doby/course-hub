---
description: "Use when adding or editing forms in apps/web or apps/native. Covers react-hook-form + zod setup, schema sourcing, localization, and error handling patterns."
applyTo: "apps/web/**,apps/native/**"
---

# Form Conventions

## Stack

- **react-hook-form** — always. Never manage form state manually.
- **zod** — validation. Schema must come from `@repo/contract`.
- **`@hookform/resolvers/zod`** — connect the two via `zodResolver`.

## Schema

Schema comes from `@repo/contract`, not defined inline in the component.

If the form needs extra fields not in the contract schema (e.g. `confirmPassword`), extend it locally with `.extend()` and `.refine()`. Localize any custom messages via `t()`.

```tsx
// ✅ base schema from contract, extended locally
import { AuthSignUpQuerySchema } from "@repo/contract";

const createSchema = (t: TFunction) =>
  AuthSignUpQuerySchema.extend({
    confirmPassword: z.string(),
  }).refine((d) => d.password === d.confirmPassword, {
    message: t("auth.signup.passwordsMismatch"),
    path: ["confirmPassword"],
  });

type FormData = z.infer<ReturnType<typeof createSchema>>;

// ❌ wrong — schema defined from scratch in the component
const schema = z.object({ email: z.string().email(), password: z.string() });
```

When there are no custom rules, use the contract schema directly as the type source:

```tsx
import { AuthLoginQuerySchema, type AuthLogInUserReq } from "@repo/contract";
// AuthLogInUserReq is the inferred type — use it directly
```

## Zod locale

Call `useZodLocale(i18n)` at the top of the component **before** `useForm`. This ensures `zodResolver` emits localized error messages.

```tsx
import { useZodLocale } from "@repo/shared";

const { t, i18n } = useT();
useZodLocale(i18n); // ← must come before useForm
```

## useForm setup

```tsx
const {
  register,
  handleSubmit,
  setError,
  formState: { errors },
} = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

## Error handling

Use `useErrorHandlingForm` from `@repo/shared` for all API error mapping. Pass `t`, `i18n`, and `setError`.

```tsx
import { useErrorHandlingForm } from "@repo/shared";

const { handleErrorForm } = useErrorHandlingForm<FormData>({ t, i18n, setError });
```

Call `handleErrorForm` in the mutation's `onError` callback:

```tsx
mutate(
  { data },
  {
    onSuccess: () => router.replace("/"),
    onError: (error: unknown) => handleErrorForm(error as Error),
  }
);
```

`handleErrorForm`:
- Maps Zod field issues from the API response to individual field errors via `setError`.
- Falls back to a root error (`errors.root`) for non-field errors.
- Renders `errors.root` in the JSX with an `<Alert variant="destructive">`.

## Full pattern (reference)

```tsx
"use client";

import { useId } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { TFunction } from "@repo/i18n";
import { AlertCircleIcon } from "lucide-react";
import { useSomeApiMutation } from "@repo/api-client";
import { SomeQuerySchema } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingForm, useZodLocale } from "@repo/shared";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui-web/components/field";
import { Input } from "@repo/ui-web/components/input";
import { Alert, AlertTitle } from "@repo/ui-web/components/alert";
import { Button } from "@repo/ui-web/components/button";

// Extend only when extra fields or custom refinements are needed
const createSchema = (t: TFunction) =>
  SomeQuerySchema.extend({
    confirmValue: z.string(),
  }).refine((d) => d.value === d.confirmValue, {
    message: t("ns.key.mismatch"),
    path: ["confirmValue"],
  });

type FormData = z.infer<ReturnType<typeof createSchema>>;

export function SomeForm() {
  const id = useId();
  const router = useRouter();
  const { t, i18n } = useT();
  useZodLocale(i18n);

  const schema = createSchema(t);
  const { mutate, isPending } = useSomeApiMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { handleErrorForm } = useErrorHandlingForm<FormData>({ t, i18n, setError });

  function onSubmit(data: FormData) {
    mutate(
      { data },
      {
        onSuccess: () => router.replace("/"),
        onError: (error: unknown) => handleErrorForm(error as Error),
      }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${id}-value`}>{t("ns.key.label")}</FieldLabel>
          <Input id={`${id}-value`} {...register("value")} />
          <FieldError errors={[errors.value]} />
        </Field>
        {errors.root && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{errors.root.message}</AlertTitle>
          </Alert>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "…" : t("ns.key.submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
```

## Checklist

- [ ] Schema sourced from `@repo/contract` (extend only when necessary)
- [ ] Custom refinement messages use `t()` for localization
- [ ] `useZodLocale(i18n)` called before `useForm`
- [ ] `useForm` uses `zodResolver(schema)`
- [ ] `useErrorHandlingForm` wired with `{ t, i18n, setError }`
- [ ] `handleErrorForm` called in `onError`
- [ ] `errors.root` rendered in JSX with `<Alert variant="destructive">`
- [ ] Field IDs use `useId()` for uniqueness
- [ ] `noValidate` on `<form>` to let zod own validation
