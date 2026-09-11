import z from "zod";
import { registry } from "api/openapi/registry";
import { ParamsTokenSchema, ApiErrorSchema } from "@repo/contract";

// GET /public/invitations/:token (public, no auth required)
registry.registerPath({
  method: "get",
  path: "/v1/public/invitations/{token}",
  operationId: "getInvitationInfo",
  tags: ["Invitations"],
  security: [],
  request: {
    params: ParamsTokenSchema,
  },
  responses: {
    200: {
      description: "Invitation info by token",
      content: {
        "application/json": {
          schema: z.object({
            course: z.object({
              name: z.string(),
              publicId: z.string(),
              description: z.string().nullable(),
            }),
            type: z.enum(["email", "link"]),
            email: z.string().nullable(),
          }),
        },
      },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});
