---
description: "Use when writing or editing Express API code: controllers, services, repositories, routes, middleware, or OpenAPI annotations in apps/api/."
applyTo: "apps/api/**"
---

# API Conventions

## Module structure

Each feature lives under `apps/api/src/modules/<feature>/` with this layout:

```
<feature>/
├── controllers/   # Read from res.locals, call service, send response
├── services/      # Business logic, throw typed errors
├── repository/    # Drizzle queries only — no business logic
├── routes/        # Express Router, middleware chain, delegate to controller
└── openapi/       # registry.registerPath() calls — no runtime logic
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

Controllers only orchestrate: read `res.locals`, call service, send response. No business logic.

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
    if (existing) throw new ConflictError({ code: ErrorCodeUser.ALREADY_EXISTS });
    const [result] = await usersRepository.createUser(user);
    return result;
  },
};
```

## Repository pattern

Repositories contain only Drizzle queries. Return raw DB rows; let the service shape the response.

```ts
export const usersRepository = {
  createUser: async (data: CreateUserReq) => {
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

## Route middleware order

```ts
router.get(
  "/:id",
  handleAuth, // 1. auth (if protected)
  validateAdminRole(), // 2. role check (if needed)
  validate(ParamsIdSchema, "params"), // 3. input validation
  pagination(), // 4. pagination (list routes only)
  async (_req, res) => {
    await controller.method(res);
  }
);
```

## Auth middleware

- Protected routes: apply `handleAuth` from `apps/api/src/middleware/auth.ts`
- On success: `res.locals.user` contains the Supabase user object
- Web uses HTTP-only cookies; native uses `Authorization: Bearer <token>`

## Pagination

Apply the `pagination()` middleware on list endpoints. It reads `page` (0-based) and `limit` (1–100) from query params and writes to `res.locals.pagination` (`{ page, limit, offset }`).

## OpenAPI annotations

Register paths in `apps/api/src/modules/<feature>/openapi/<feature>.ts` via `registry.registerPath()`. These are **not decorators** — they are plain side-effect calls:

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

## Shared vs. native endpoints

Web and native clients share **all** endpoints except auth. Auth is the only exception: it has `/native` variants (e.g. `POST /v1/auth/login/native`) because token delivery differs (cookie vs. JSON body). Do **not** create `/native` variants for non-auth features.
