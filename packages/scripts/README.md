# Scripts

Standalone TypeScript scripts that run against the database via `tsx`. No build step needed.

## Prerequisites

1. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL`.
2. Ensure the target user already exists in the database (run the users seed first if needed).

## Available Scripts

| Script                    | Description                                                           |
| ------------------------- | --------------------------------------------------------------------- |
| `db:seed:users`           | Insert mock users                                                     |
| `db:clean:users`          | Delete all mock users                                                 |
| `db:seed:course-content`  | Seed courses, topics, and lectures for a target user                  |
| `db:clean:course-content` | Delete all courses (and their topics/lectures) owned by a target user |

## Running Scripts

Run any script from the **monorepo root**:

```bash
pnpm db:seed:users
pnpm db:clean:users

pnpm db:seed:course-content
pnpm db:clean:course-content
```

Or run directly from this package:

```bash
cd packages/scripts
pnpm db:seed:course-content
```

## Configuring the Target User

Open the script file and change `TARGET_USER_EMAIL` at the top:

```ts
// dbSeedCourseContent.ts  /  dbCleanCourseContent.ts
const TARGET_USER_EMAIL = "iampavle.test+3@gmail.com";
```

> The seed script is idempotent — running it multiple times is safe. Existing courses (matched by slug) and existing topics/lectures are skipped.
