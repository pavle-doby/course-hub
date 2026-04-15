# Course Hub

Course Hub is a web platform for hosting and sharing online courses. It provides a user-friendly interface for course creators to upload their content and for students to access and learn from it.

## Tech stack

- **Next.js** — web application (App Router)
- **Expo / React Native** — mobile application
- **Tamagui** — cross-platform UI components
- **Express.js** — REST API backend
- **Supabase** — database & authentication
- **Drizzle ORM** — type-safe database interactions
- **Zod** — shared schema validation (`@my/contract`)
- **Orval + OpenAPI** — auto-generated React Query API client
- **Turborepo + Yarn 4** — monorepo build orchestration

## Project structure

```
course-hub/
├── apps/
│   ├── api/                        # REST API (Express.js)
│   │   └── src/
│   │       ├── modules/            # Feature modules
│   │       │   ├── auth/           # Auth module
│   │       │   │   ├── controllers/
│   │       │   │   ├── openapi/
│   │       │   │   ├── repository/
│   │       │   │   ├── routes/
│   │       │   │   ├── services/
│   │       │   │   └── utils/
│   │       │   └── users/          # Users module (same structure)
│   │       ├── middleware/         # Auth, validation, error handling
│   │       ├── openapi/            # OpenAPI spec generation
│   │       ├── repositories/       # Shared repository utilities
│   │       ├── routes/             # Top-level route registration
│   │       ├── services/           # Shared service utilities
│   │       ├── logger/             # Logger setup
│   │       ├── types/              # Shared API types
│   │       └── utils/              # Shared utilities
│   ├── next/                       # Next.js web app
│   │   ├── app/                    # App Router pages
│   │   │   ├── auth/[mode]/        # Sign in / sign up / forgot password
│   │   │   └── user/[id]/          # User profile page
│   │   └── e2e/                    # Playwright e2e tests
│   └── expo/                       # Expo mobile app
│       └── app/                    # Expo Router pages
│           └── user/               # User screens
│
├── packages/
│   ├── contract/                   # Zod schemas + TS types (source of truth for DTOs)
│   │   └── src/
│   │       ├── auth/               # Auth schemas & types
│   │       ├── users/              # Users schemas & types
│   │       └── shared/             # Shared schemas & types
│   ├── db-schema/                  # Drizzle table definitions
│   │   └── src/
│   │       └── schemas/            # Table schema files
│   ├── db/                         # DB client + migrations (Drizzle ORM)
│   ├── api-client/                 # Auto-generated React Query hooks (never edit manually)
│   │   └── src/
│   │       └── generated/          # Orval output — do not edit
│   ├── app/                        # Cross-platform feature screens & providers
│   │   ├── features/
│   │   │   ├── auth/               # Auth screens & forms
│   │   │   ├── home/               # Home screen
│   │   │   └── user/               # User profile screen
│   │   ├── hooks/                  # Shared hooks (errors, toast)
│   │   └── provider/               # App-level providers (Tamagui, Toast, etc.)
│   ├── ui/                         # Shared Tamagui component library
│   ├── config/                     # Tamagui design tokens & theme config
│   └── scripts/                    # DB seed / cleanup scripts
│
└── spec/                           # Feature specifications & architecture docs
```

## How to run

### Install dependencies:

```bash
yarn
```

### Start the development servers:

> In first terminal, start the API server:

```bash
# Start the API server
yarn api
```

> In second terminal, start the Next.js app:

```bash
# Start the Next.js app
yarn web
```

Happy coding! 🚀

## Cool scripts

### Database scripts

- `yarn db:generate` - Generate Drizzle ORM types from the database schema
- `yarn db:push` - Run database migrations

- `yarn db:clean:<table>` - Clean up the data form a specific table (e.g. `yarn db:clean:users`)
- `yarn db:seed:<table>` - Seed the data for a specific table (e.g. `yarn db:seed:users`)

### API client generation

- `yarn api-client:generate` - Generate the API client using Orval based on the OpenAPI spec from the API server

> Make sure the API server is running before generating the client, and that all API routes are properly documented with OpenAPI annotations.

### Count lines of code

```bash
cloc . \
  --exclude-dir=node_modules,.next,dist,build,Pods,.turbo,.expo,generated,playwright-report,ios \
  --exclude-ext=sql
```

## Dev Guide

The app is designed with a modular architecture, where each feature is organized into its own module. This allows for better separation of concerns and easier maintenance.

Also with a specific flow in mind:

1. **Define DB Table**: Start by defining the database table for your feature in the `db-schema` package. This will include the table structure and any relationships.

2. **Define Contracts**: Next, define the API contracts (schemas & TS types) for your feature in the `contract` package using `drizzle-zod` helpers based on the DB schema. This will ensure type safety across the stack.

3. **Implement API Logic**: Then, implement the API logic for your feature using `contracts` as "`inputs`" and "`outputs`" for the feature, in the `api` package. This will include creating the necessary `routes`, `services`, and `repositories` to handle the business logic and data access.

4. **Generate API Client**: Then based on `api` implementation and `openapi` specification for the routes, generate `api-client` hooks (TanStack Query Hooks) by running the `api-client:generate` script. This will create type-safe API client hooks that can be used in the frontend.

5. **Use in Frontend**: Finally, develop the frontend. Where generale UI components can be added to the `ui` package, and the main app logic (e.g. React Context providers, feature composition) can be implemented in the `app` package. You can then use the generated API client hooks to interact with your backend API.

### TLDR

1. Define DB table in `db-schema`
2. Define API contracts in `contract` using `drizzle-zod`
3. Implement API logic in `api` using the contracts
4. Generate API client with `api-client:generate`
5. Use generated API client hooks in the frontend (`app` + `ui`)
