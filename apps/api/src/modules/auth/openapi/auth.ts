import { registry } from 'api/openapi/registry';
import {
  NativeAuthTokensSchema,
  NativeAuthWithTokensSchema,
  UserSchema,
} from 'api/openapi/schemas';
import {
  ApiErrorSchema,
  AuthLoginQuerySchema,
  AuthNativeRefreshQuerySchema,
  AuthSignUpQuerySchema,
} from '@my/contract';

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

registry.registerPath({
  method: 'post',
  path: '/v1/auth/signup/native',
  operationId: 'authNativeSignUp',
  tags: ['Auth'],
  request: {
    body: {
      content: { 'application/json': { schema: AuthSignUpQuerySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'User signed up successfully',
      content: { 'application/json': { schema: NativeAuthWithTokensSchema } },
    },
    default: {
      description: 'Error',
      content: { 'application/json': { schema: ApiErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/v1/auth/login/native',
  operationId: 'authNativeLogin',
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
      content: { 'application/json': { schema: NativeAuthWithTokensSchema } },
    },
    default: {
      description: 'Error',
      content: { 'application/json': { schema: ApiErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/v1/auth/signout/native',
  operationId: 'authNativeSignOut',
  tags: ['Auth'],
  responses: {
    200: { description: 'Signed out successfully' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/v1/auth/refresh/native',
  operationId: 'authNativeRefreshToken',
  tags: ['Auth'],
  request: {
    body: {
      content: { 'application/json': { schema: AuthNativeRefreshQuerySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Tokens refreshed successfully',
      content: { 'application/json': { schema: NativeAuthTokensSchema } },
    },
    default: {
      description: 'Error',
      content: { 'application/json': { schema: ApiErrorSchema } },
    },
  },
});
