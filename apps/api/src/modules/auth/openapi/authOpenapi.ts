import { registry } from "api/openapi/registry";
import { AuthTokensSchema, AuthWithTokensSchema } from "api/openapi/schemas";
import {
  ApiErrorSchema,
  AuthLoginQuerySchema,
  AuthRefreshQuerySchema,
  AuthSignUpQuerySchema,
} from "@repo/contract";

registry.registerPath({
  method: "post",
  path: "/v1/auth/signup",
  operationId: "authSignUp",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: AuthSignUpQuerySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "User signed up successfully",
      content: { "application/json": { schema: AuthWithTokensSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/v1/auth/login",
  operationId: "authLogin",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: AuthLoginQuerySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Logged in successfully",
      content: { "application/json": { schema: AuthWithTokensSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/v1/auth/signout",
  operationId: "authSignOut",
  tags: ["Auth"],
  responses: {
    200: { description: "Signed out successfully" },
  },
});

registry.registerPath({
  method: "post",
  path: "/v1/auth/refresh",
  operationId: "authRefreshToken",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: AuthRefreshQuerySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Tokens refreshed successfully",
      content: { "application/json": { schema: AuthTokensSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});
