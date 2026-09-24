import { registry } from "api/openapi/registry";
import { ApiTokenSchema, CreateApiTokenResponseSchema } from "api/openapi/schemas";
import { ApiErrorSchema, CreateApiTokenBodySchema, ParamsIdSchema } from "@repo/contract";
import { z } from "zod";

const errorResponse = {
  description: "Error",
  content: { "application/json": { schema: ApiErrorSchema } },
};

// GET /api-tokens
registry.registerPath({
  method: "get",
  path: "/v1/api-tokens",
  operationId: "getApiTokens",
  tags: ["ApiTokens"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Active personal access tokens",
      content: { "application/json": { schema: z.array(ApiTokenSchema) } },
    },
    default: errorResponse,
  },
});

// POST /api-tokens
registry.registerPath({
  method: "post",
  path: "/v1/api-tokens",
  operationId: "createApiToken",
  tags: ["ApiTokens"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CreateApiTokenBodySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Token created; plaintext token is only returned here",
      content: { "application/json": { schema: CreateApiTokenResponseSchema } },
    },
    default: errorResponse,
  },
});

// DELETE /api-tokens/:id
registry.registerPath({
  method: "delete",
  path: "/v1/api-tokens/{id}",
  operationId: "deleteApiToken",
  tags: ["ApiTokens"],
  security: [{ bearerAuth: [] }],
  request: { params: ParamsIdSchema },
  responses: {
    204: { description: "Token revoked" },
    default: errorResponse,
  },
});
