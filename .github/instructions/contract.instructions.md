---
description: "Use when adding or editing schemas, types, or error codes in packages/contract/. Covers drizzle-zod derivation, file structure, type exports, and error enum conventions."
applyTo: "packages/contract/**"
---

# Contract Package Conventions

`@repo/contract` is the single source of truth for all DTOs, validation schemas, and error types shared across `api`, `web`, and `native`. Every schema and type must live here — never define them inline in an app.

## Feature folder structure

Each feature gets its own folder with exactly these four files:

```
packages/contract/src/<feature>/
├── schemas.ts   # Zod schemas (derived from drizzle-zod where possible)
├── types.ts     # TypeScript types inferred from schemas
├── errors.ts    # Feature-specific error code enum
└── index.ts     # Barrel: export * from each of the three files above
```

After adding a new feature, re-export it from `packages/contract/src/index.ts`:

```ts
export * from "./<feature>";
```

## Schema derivation — always use drizzle-zod for DB-backed entities

Derive from the Drizzle table in `@repo/db-schema`. Never write field definitions by hand when a table exists.

```ts
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { users } from "@repo/db-schema";

// SELECT shape — omit internal/audit timestamps
export const UserSchema = createSelectSchema(users).omit({
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

// INSERT shape — omit server-generated fields, override types where needed
export const UserPostQuerySchema = createInsertSchema(users, {
  email: z.email(),
}).omit({ id: true, createdAt: true, updatedAt: true, lastLogin: true });

// UPDATE shape — same omits, make everything optional
export const UserPutQuerySchema = createUpdateSchema(users)
  .omit({ id: true, createdAt: true, updatedAt: true, lastLogin: true })
  .partial();
```

For request bodies with no DB table (e.g. auth), write schemas manually with plain `z.object()`.

## Type exports — always infer from schemas

Never write `type` fields manually when a schema exists for it.

```ts
// ✅ correct
export type User = z.infer<typeof UserSchema>;

// ❌ wrong — duplicates schema definition
export type User = { id: string; email: string; ... };
```

For request/response pairs use the `Req` / `Res` suffix convention:

```ts
export type CreateUserReq = z.infer<typeof UserPostQuerySchema>;
export type CreateUserRes = User;

export type GetAllUsersReq<Pagination = PaginationReq> = Pagination & Partial<Search> & FilterUser;
export type GetAllUsersRes = PaginationRes<User>;
```

## Error codes — one enum per feature

Define a `ErrorCode<Feature>` enum in `errors.ts`. Values use a `<feature>_` prefix to avoid collisions:

```ts
// packages/contract/src/users/errors.ts
export enum ErrorCodeUser {
  NOT_FOUND = "user_not_found",
  ALREADY_EXISTS = "user_already_exists",
}
```

Global/cross-cutting codes live in `packages/contract/src/shared/errors/ErrorCode.ts`. Only add to the global enum for truly infrastructure-level codes (`NO_TOKEN`, `VALIDATION_ERROR`, etc.). Feature business errors always go in their own enum.

## Barrel exports

Each feature `index.ts` re-exports all three files:

```ts
export * from "./schemas";
export * from "./types";
export * from "./errors";
```

`shared/index.ts` re-exports its subdirectories:

```ts
export * from "./types";
export * from "./schemas";
export * from "./errors";
```

## Shared utilities

Cross-feature primitives belong in `src/shared/`:

- **`schemas.ts`** — `PaginationSchema`, `ParamsIdSchema`, `SearchSchema`, reusable helpers (`paramBoolean`, `isoDatetime`)
- **`types.ts`** — `PaginationReq`, `PaginationRes<T>`, `Search`
- **`errors/`** — HTTP error classes (`BadRequestError`, `NotFoundError`, …) and `ErrorCode` global enum

Do **not** put feature-specific logic in `shared/`.
