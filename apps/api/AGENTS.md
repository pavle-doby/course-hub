# API Conventions

## Module structure

Each feature lives under `apps/api/src/modules/<feature>/` with this layout:

```
<feature>/
├── controllers/   # Read from res.locals, call service, send response
├── services/      # Business logic, throw typed errors
├── repository/    # Drizzle queries only — no business logic
├── routes/        # Express Router, middleware chain, delegate to controller
├── openapi/       # registry.registerPath() calls — no runtime logic
└── ai/tools/      # (optional) AI course tools for this feature — see "AI course tools"
```

## Request data is in `res.locals`, never `req.body`

The `validate(Schema, source?)` middleware parses and writes to `res.locals.body` (default), `.query`, or `.params`. Always read from there:

```ts
// ✅ correct
const dto = res.locals.body as CreateUserReq;

// ❌ wrong
const dto = req.body;
```

## Controller pattern

Controllers only orchestrate: read `res.locals`, call service, send response. No business logic. Assign every `res.locals` value to a typed local variable before passing it to a service; never pass `res.locals.*` inline.

```ts
export const usersController = {
  createUser: async (_req: Request, res: Response): Promise<void> => {
    const reqDto = res.locals.body as CreateUserReq;
    const resDto: CreateUserRes = await usersService.createUser(reqDto);
    res.status(201).json(resDto);
  },
};
```

## Service pattern

Services own business logic and throw typed errors. They call repositories, never `db` directly.

```ts
export const usersService = {
  createUser: async (user: CreateUserReq): Promise<CreateUserRes> => {
    const existing = await usersRepository.getUserByEmail(user.email);
    if (existing) {
      throw new ConflictError({ code: ErrorCodeUser.ALREADY_EXISTS });
    }
    const [result] = await usersRepository.createUser(user);
    return result;
  },
};
```

## Repository pattern

Repositories contain only Drizzle queries. Return raw DB rows; let the service shape the response.

```ts
export const usersRepository = {
  createUser: async (data: CreateUserReq): Promise<UserEntity[]> => {
    return await db.insert(schema.users).values(data).returning({ ... });
  },
};
```

## Error handling

Always use typed error classes from `@repo/contract`. Never `res.status(400).json(...)` directly.

```ts
import { NotFoundError, ConflictError, BadRequestError } from "@repo/contract";

throw new NotFoundError({ code: ErrorCodeUser.NOT_FOUND });
```

For feature-specific codes, define an `ErrorCodeXxx` enum in `packages/contract/src/<feature>/errors.ts` (follow `ErrorCodeAuth` / `ErrorCodeUser` as examples).

## Route definitions

Every route gets two comment markers:

1. **Above the route**: a one-line description in the form `// <PREFIX> <path> → <small description>`, where `<PREFIX>` is the HTTP method plus the mounted base path (e.g. `/courses`, `/public/courses`). For public routes, note that no auth is required.

```ts
// GET /public/courses/:publicId → get published course by public id, no auth required
```

2. **As the first argument**: a single `//` comment on its own line. Every route argument is then placed on its own line (column layout). This keeps prettier from collapsing the definition into a single line and keeps all params aligned.

```ts
router.get(
  //
  "/:id",
  handleAuth,
  validateAdminRole(),
  validate(ParamsIdSchema, "params"),
  pagination(),
  async (_req, res) => {
    await controller.method(res);
  }
);
```

## Auth middleware

- Protected routes: apply `handleAuth` from `apps/api/src/middleware/auth.ts`
- On success: `res.locals.user` contains the Supabase user object
- Token-authenticated clients use `Authorization: Bearer <token>`

## Public and private routes

Split public and private routes for every feature that exposes both, following courses:

- Public routes live in `<feature>/routes/<feature>PublicRoutes.ts`, have no `handleAuth`, and mount at `/v1/public/<feature>`.
- Private routes live in `<feature>/routes/<feature>Routes.ts`, apply `handleAuth` to every protected endpoint, and mount at `/v1/<feature>`.
- Aggregate `/v1/public/*` mounts in `src/routes/apiPublicRoutes.ts`; keep all other mounts in `src/routes/apiRoutes.ts`.
- Register public paths in a separate `<feature>PublicOpenapi.ts` file and import both OpenAPI files from `src/openapi/spec.ts`.

## Pagination

Apply the `pagination()` middleware on list endpoints. It reads `page` (0-based) and `limit` (1–100) from query params and writes to `res.locals.pagination` (`{ page, limit, offset }`).

## AI course tools

AI tools (used by the MCP server at `/apix/v1/mcp` and the course-edit chat) live in the module of the feature they act on, never in `modules/ai/`:

```
modules/<feature>/ai/tools/<feature>Tools.ts   # e.g. modules/lessons/ai/tools/lessonsTools.ts
```

`modules/ai/` only holds shared infrastructure: `ai/tools/courseTool.ts` (`CourseTool` type, `defineTool`), `ai/tools/index.ts` (the `courseTools` registry) and `ai/mcp/` (MCP transport).

To add a tool:

1. Add its input schema to `packages/contract/src/ai/schemas.ts` (derived from the feature's contract schemas, with array size caps) and its type to `types.ts`.
2. Define it with `defineTool` in `modules/<feature>/ai/tools/<feature>Tools.ts`. Import `defineTool` from `api/modules/ai/tools/courseTool` (not the `ai/tools` barrel — the barrel imports the tool files, so that would be circular).
3. Register it in the `courseTools` array in `modules/ai/tools/index.ts`. MCP picks it up automatically.

Tool rules:

- Name it `ch_<verb>_<noun>`, and write `description` for an LLM reader: what it returns, that writes never publish, and when to call `ch_get_course` first.
- Handlers call the feature's **services** (not HTTP), so ownership checks and business logic are never duplicated. Every tool acts only on courses the caller created (`ctx.authUserId`); `ch_search_public_courses` is the only exception.
- Never accept `status` or `visibility`, and never expose deletes.
- Return compact data (no timestamps, media ids or creator info).

## OpenAPI annotations

Register paths in `apps/api/src/modules/<feature>/openapi/<feature>Openapi.ts` via `registry.registerPath()`. These are **not decorators** — they are plain side-effect calls:

```ts
import { registry } from "api/openapi/registry";
import { ApiErrorSchema, UserPostQuerySchema } from "@repo/contract";
import { UserSchema } from "api/openapi/schemas";

registry.registerPath({
  method: "post",
  path: "/v1/users",
  operationId: "usersCreate",
  tags: ["Users"],
  request: {
    body: {
      content: { "application/json": { schema: UserPostQuerySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Created",
      content: { "application/json": { schema: UserSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});
```

Import the file as a side-effect in `apps/api/src/openapi/spec.ts`, then run `pnpm api-client:generate`.
