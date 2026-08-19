---
description: "Use when adding or editing Drizzle table definitions, enums, relations, or entity types in packages/db-schema/. Covers file structure, column naming, standard columns, enums, foreign keys, and entity type exports."
applyTo: packages/db-schema/**
---

# DB Schema Conventions (`@repo/db-schema`)

This package is the **source of truth for all database structure**. Changes here drive Drizzle migrations and are consumed by `@repo/contract` (via drizzle-zod) and `@repo/db` (via re-export). Never define table shapes anywhere else.

## File Structure

```
src/
├── index.ts              # re-exports: export * from './schemas'; export * from './types';
├── types.ts              # InferSelectModel entity types only
└── schemas/
    ├── index.ts          # re-exports all schema files
    ├── enums.ts          # all pgEnum definitions
    ├── relations.ts      # all drizzle-orm relations (defineRelations)
    └── <feature>.ts      # one file per entity (e.g., users.ts, file-uploads.ts)
```

- One file per entity — no merging unrelated tables into the same file.
- Enums always live in `enums.ts`, never inline in a table file.
- Relations always live in `relations.ts`.

## Naming Conventions

| Thing                    | Convention                   | Example                          |
| ------------------------ | ---------------------------- | -------------------------------- |
| Table variable           | camelCase plural             | `fileUploads`, `users`           |
| SQL table name string    | snake_case plural            | `'file_uploads'`, `'users'`      |
| Column variable (JS key) | camelCase                    | `firstName`, `createdAt`         |
| SQL column name string   | snake_case                   | `'first_name'`, `'created_at'`   |
| File name                | kebab-case                   | `file-uploads.ts`                |
| pgEnum variable          | camelCase + `Enum` suffix    | `userRoleEnum`, `userStatusEnum` |
| SQL enum name string     | snake_case                   | `'user_role'`, `'user_status'`   |
| Entity type              | PascalCase + `Entity` suffix | `UserEntity`, `FileUploadEntity` |

## Standard Columns

Every table must have these columns unless there is an explicit reason to omit them:

```ts
id: uuid('id').primaryKey().defaultRandom(),
createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
```

- UUIDs for all primary keys — never serial/integer IDs.
- All timestamps must use `{ withTimezone: true }`.

## Enums (`src/schemas/enums.ts`)

```ts
import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
```

- Import enums into table files from `./enums`, not from `@repo/db-schema` (avoid circular imports).
- Export all enums from `src/schemas/index.ts`.

## Foreign Keys

Use `references()` with an explicit `onDelete` strategy:

```ts
userId: uuid('user_id')
  .notNull()
  .references(() => users.id, { onDelete: 'cascade' }),
```

Always choose `'cascade'`, `'set null'`, or `'restrict'` intentionally — never omit `onDelete`.

## Entity Types (`src/types.ts`)

Add an `InferSelectModel` type for every table:

```ts
import type { InferSelectModel } from "drizzle-orm";
import type { fileUploads, users } from "./schemas";

export type UserEntity = InferSelectModel<typeof users>;
export type FileUploadEntity = InferSelectModel<typeof fileUploads>;
```

- These types are consumed by `@repo/contract` to derive narrow `UserRole`, `UserStatus`, etc. union types.
- Never use `InferInsertModel` here — insert shapes belong in `@repo/contract`.

## Exports Checklist

When adding a new table:

1. Create `src/schemas/<feature>.ts` with the table definition.
2. Add `export * from './<feature>';` to `src/schemas/index.ts`.
3. Add `export type <Feature>Entity = InferSelectModel<typeof <feature>>;` to `src/types.ts`.
4. If new enums are needed, add them to `src/schemas/enums.ts` and ensure they are exported via `src/schemas/index.ts`.
5. Run `pnpm db:generate && pnpm db:push` to create and apply the migration.
6. Update `@repo/contract` to derive Zod schemas from the new table.
