import { registry } from "api/openapi/registry";
import { OauthApproveResponseSchema } from "api/openapi/schemas";
import { ApiErrorSchema, OauthApproveBodySchema } from "@repo/contract";

const errorResponse = {
  description: "Error",
  content: { "application/json": { schema: ApiErrorSchema } },
};

// POST /oauth/approve
registry.registerPath({
  method: "post",
  path: "/v1/oauth/approve",
  operationId: "approveOauth",
  tags: ["Oauth"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: OauthApproveBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Redirect URL back to the OAuth client (with a code, or access_denied)",
      content: { "application/json": { schema: OauthApproveResponseSchema } },
    },
    default: errorResponse,
  },
});
