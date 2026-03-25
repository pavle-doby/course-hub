import { registry } from 'api/openapi/registry';
import { UserSchema } from 'api/openapi/schemas';
import { AuthLoginQuerySchema, AuthSignUpQuerySchema, ApiErrorSchema } from '@my/contract';

registry.registerPath({
  method: 'post',
  path: '/v1/auth/signup',
  operationId: 'authSignUp',
  tags: ['Auth'],
  request: {
    body: {
      content: { 'application/json': { schema: AuthSignUpQuerySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'User signed up successfully',
      content: { 'application/json': { schema: UserSchema } },
    },
    default: {
      description: 'Error',
      content: { 'application/json': { schema: ApiErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/v1/auth/login',
  operationId: 'authLogin',
  tags: ['Auth'],
  request: {
    body: {
      content: { 'application/json': { schema: AuthLoginQuerySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Logged in successfully',
      content: { 'application/json': { schema: UserSchema } },
    },
    default: {
      description: 'Error',
      content: { 'application/json': { schema: ApiErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/v1/auth/signout',
  operationId: 'authSignOut',
  tags: ['Auth'],
  responses: {
    200: { description: 'Signed out successfully' },
  },
});
