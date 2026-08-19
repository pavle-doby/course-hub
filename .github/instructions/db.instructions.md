---
description: "Use when editing packages/db/ — the Drizzle client, env config, schema re-export, or drizzle.config.ts. Covers what to export, how env is validated, the connection setup, and migration workflow."
applyTo: packages/db/**
---

# DB Package Conventions (`@repo/db`)

This package owns the **Drizzle ORM client**, the **database connection**, and the **migration toolchain**. It does not define table shapes — those live in `@repo/db-schema`.

## File Structure

```
src/
├── client.ts     # postgres.js client + drizzle() instance
├── env.ts        # dotenv loader + typed env object
├── index.ts      # public exports
└── schema.ts     # re-exports everything from @repo/db-schema
drizzle/          # generated migration files — never edit by hand
drizzle.config.ts # drizzle-kit config — points schema at src/schema.ts
.env.example      # must list every env var used in env.ts
```

## Public Exports (`src/index.ts`)

```ts
export * from "./client"; // db, client
export * as schema from "@repo/db-schema"; // all tables/enums
```

- `db` — the Drizzle query client; the only object repositories should use for queries.
- `schema` — the full table map; always access tables via `schema.<table>`, never import tables directly from `@repo/db-schema` in `apps/api/`.
- Never add business logic or query helpers to this package.

## Client Setup (`src/client.ts`)

```ts
import * as schema from "@repo/db-schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./env";

export const client = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle(client, { schema });
```

- `{ prepare: false }` is required — Supabase Transaction pool mode does not support prepared statements.
- The schema object passed to `drizzle()` enables relational query helpers (`db.query.*`).

## Env Config (`src/env.ts`)

```ts
import dotenv from "dotenv";

dotenv.config({ path: [".env", ".env.local"] });

export const env = process.env as {
  DATABASE_URL: string;
};
```

- Loads `.env` then `.env.local` (local overrides win).
- Every env var used anywhere in this package must be declared in `env.ts` **and** listed in `.env.example`.
- Do not import `env` from `apps/api/` or other packages — each app/package owns its own env module.

## Schema Re-export (`src/schema.ts`)

```ts
export * from "@repo/db-schema";
```

This is the single entry-point `drizzle.config.ts` uses. Do not add anything else here.

## Drizzle Config (`drizzle.config.ts`)

```ts
export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL! },
  verbose: true,
  strict: true,
} satisfies Config;
```

- `schema` must always point to `./src/schema.ts` (which re-exports from `@repo/db-schema`).
- `out` is always `./drizzle` — migration files are committed to the repo.
- Never set `strict: false`.

## Migration Workflow

```bash
pnpm db:generate   # creates a new SQL file in drizzle/ after schema changes
pnpm db:push       # applies schema directly to DB (dev only — no migration file)
pnpm db:migrate    # runs pending migration files (CI / production)
```

- Always run `pnpm db:generate` after changing `@repo/db-schema` — never hand-edit files in `drizzle/`.
- Commit generated migration SQL files alongside the schema change in the same PR.
- `db:push` is for local development iteration only; production uses `db:migrate`.

## How Repositories Use This Package

Always import `db` and `schema` together from `@repo/db`:

```ts
import { db, schema } from "@repo/db";
import { eq } from "drizzle-orm";

const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
```

- Access columns via `schema.<table>.<column>` — this keeps queries type-safe against the live schema.
- Import Drizzle operator helpers (`eq`, `and`, `or`, `ilike`, `count`, `desc`, etc.) from `drizzle-orm`, not from `@repo/db`.
- Never call `client` (the postgres.js connection) directly in repositories — only use `db`.
