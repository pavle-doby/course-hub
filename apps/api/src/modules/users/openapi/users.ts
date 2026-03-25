import { registry } from 'api/openapi/registry';
import { UserSchema, PaginatedUsersSchema } from 'api/openapi/schemas';
import { UserGetAllQuerySchema, UserPostQuerySchema, UserPutQuerySchema } from '@my/contract';
import { ParamsIdSchema, SearchSchema, ApiErrorSchema } from '@my/contract';
import { PaginationParams } from 'api/middleware/pagination';

// GET /users/self
registry.registerPath({
  method: 'get',
  path: '/v1/users/self',
  operationId: 'getUserSelf',
  tags: ['Users'],
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'Current authenticated user',
      content: { 'application/json': { schema: UserSchema } },
    },
    default: { description: 'Error', content: { 'application/json': { schema: ApiErrorSchema } } },
  },
});

// GET /users
registry.registerPath({
  method: 'get',
  path: '/v1/users',
  operationId: 'getUsers',
  tags: ['Users'],
  security: [{ cookieAuth: [] }],
  request: {
    query: PaginationParams
      //
      .extend(SearchSchema.shape)
      .extend(UserGetAllQuerySchema.shape),
  },
  responses: {
    200: {
      description: 'Paginated list of users',
      content: { 'application/json': { schema: PaginatedUsersSchema } },
    },
    default: { description: 'Error', content: { 'application/json': { schema: ApiErrorSchema } } },
  },
});

// GET /users/:id
registry.registerPath({
  method: 'get',
  path: '/v1/users/{id}',
  operationId: 'getUser',
  tags: ['Users'],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsIdSchema,
  },
  responses: {
    200: {
      description: 'User by ID',
      content: { 'application/json': { schema: UserSchema } },
    },
    default: { description: 'Error', content: { 'application/json': { schema: ApiErrorSchema } } },
  },
});

// POST /users
registry.registerPath({
  method: 'post',
  path: '/v1/users',
  operationId: 'createUser',
  tags: ['Users'],
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: UserPostQuerySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'User created',
      content: { 'application/json': { schema: UserSchema } },
    },
    default: { description: 'Error', content: { 'application/json': { schema: ApiErrorSchema } } },
  },
});

// PUT /users/:id
registry.registerPath({
  method: 'put',
  path: '/v1/users/{id}',
  operationId: 'updateUser',
  tags: ['Users'],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsIdSchema,
    body: {
      content: { 'application/json': { schema: UserPutQuerySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'User updated',
      content: { 'application/json': { schema: UserSchema } },
    },
    default: { description: 'Error', content: { 'application/json': { schema: ApiErrorSchema } } },
  },
});

// DELETE /users/:id
registry.registerPath({
  method: 'delete',
  path: '/v1/users/{id}',
  operationId: 'deleteUser',
  tags: ['Users'],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsIdSchema,
  },
  responses: {
    200: {
      description: 'User deleted',
      content: { 'application/json': { schema: UserSchema } },
    },
    default: { description: 'Error', content: { 'application/json': { schema: ApiErrorSchema } } },
  },
});
