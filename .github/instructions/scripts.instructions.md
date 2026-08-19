---
description: "Use when adding or editing database scripts in packages/scripts/ — seed, clean, or one-off data migration scripts. Covers file placement, imports, connection teardown, error handling, type inference, and how to register and run scripts."
applyTo: packages/scripts/**
---

# Scripts Package Conventions (`@repo/scripts`)

Scripts are standalone TypeScript files that run against the database outside the API process. They are executed directly with `tsx` — no build step, no `src/` folder, no `dist/`.

## File Structure

```
packages/scripts/
├── dbSeedUsers.ts    # one file per script, at the package root
├── dbCleanUsers.ts
├── .env.example      # lists DATABASE_URL (value empty)
├── package.json
└── tsconfig.json
```

- Scripts live at the **package root**, not in a `src/` subdirectory.
- One script per file. File names follow the pattern `db<Action><Target>.ts` (camelCase, e.g. `dbSeedPosts.ts`, `dbCleanOrders.ts`).

## Imports

Always import `client`, `db`, and `schema` together from `@repo/db`:

```ts
import { client, db, schema } from "@repo/db";
```

Import Drizzle operator helpers (`eq`, `inArray`, `and`, etc.) from `drizzle-orm` directly — never from `@repo/db`:

```ts
import { inArray } from "drizzle-orm";
```

Never import table definitions directly from `@repo/db-schema` — use `schema.<table>` via `@repo/db`.

## Script Structure

Every script follows this shape:

```ts
import { client, db, schema } from '@repo/db';

async function <actionTarget>() {
  try {
    // database operations
  } catch (error) {
    console.error('Failed to <describe action>:', error);
    process.exitCode = 1;  // NOT process.exit(1) — lets finally run
  } finally {
    await client.end();    // always close the connection
  }
}

<actionTarget>();
```

Two rules that are never skipped:

1. **`client.end()` in `finally`** — the postgres.js connection must be explicitly closed or the process hangs.
2. **`process.exitCode = 1` on error, not `process.exit(1)`** — `process.exit()` would skip the `finally` block and leave the connection open.

## Type Inference for Seed Data

Use `$inferInsert` to type mock/seed data arrays against the live schema — no manual interface needed:

```ts
const mockUsers: Array<typeof schema.users.$inferInsert> = [
  {
    email: "test@example.com",
    firstName: "Test",
    role: "user",
    status: "approved",
  },
];
```

## Idempotent Seeds

Seed scripts must be safe to run multiple times. Use `onConflictDoNothing` targeting the natural unique key:

```ts
await db.insert(schema.users).values(mockUsers).onConflictDoNothing({ target: schema.users.email });
```

## Returning Feedback

Use `.returning()` to log what was actually inserted or deleted — makes script output useful for debugging:

```ts
const deleted = await db.delete(schema.users).returning({ id: schema.users.id });
console.log(`Deleted ${deleted.length} user(s).`);
```

## Registering a New Script

1. Create `packages/scripts/db<Action><Target>.ts`.
2. Add an entry to `packages/scripts/package.json`:
   ```json
   "db:<action>:<target>": "tsx ./db<Action><Target>.ts"
   ```
3. Add a root-level alias to the monorepo root `package.json`:
   ```json
   "db:<action>:<target>": "pnpm --filter @repo/scripts db:<action>:<target>"
   ```

Run from the monorepo root with:

```bash
pnpm db:<action>:<target>
```

## Environment

Scripts read `DATABASE_URL` from `.env.local` (loaded by `@repo/db`'s `dotenv` setup). Keep `.env.example` up to date with every env var the scripts depend on.
