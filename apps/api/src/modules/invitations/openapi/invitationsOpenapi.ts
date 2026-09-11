import z from "zod";
import { registry } from "api/openapi/registry";
import { CourseInvitationSchema, PaginatedCourseInvitationsSchema } from "api/openapi/schemas";
import { PaginationParams } from "api/middleware/pagination";
import {
  CreateEmailInvitationBodySchema,
  ParamsIdSchema,
  ParamsPublicIdSchema,
  ParamsTokenSchema,
  SearchSchema,
  ApiErrorSchema,
} from "@repo/contract";

// POST /invitations/courses/:publicId → invite a specific email to a private course
registry.registerPath({
  method: "post",
  path: "/v1/invitations/courses/{publicId}",
  operationId: "createEmailInvitation",
  tags: ["Invitations"],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsPublicIdSchema,
    body: {
      content: { "application/json": { schema: CreateEmailInvitationBodySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Email invitation created",
      content: { "application/json": { schema: CourseInvitationSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// POST /invitations/courses/:publicId/link → generate a one-time enrollment link
registry.registerPath({
  method: "post",
  path: "/v1/invitations/courses/{publicId}/link",
  operationId: "createInviteLink",
  tags: ["Invitations"],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsPublicIdSchema,
  },
  responses: {
    201: {
      description: "One-time invitation link created",
      content: { "application/json": { schema: CourseInvitationSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// GET /invitations/courses/:publicId → list invitations for a course (creator only)
registry.registerPath({
  method: "get",
  path: "/v1/invitations/courses/{publicId}",
  operationId: "getCourseInvitations",
  tags: ["Invitations"],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsPublicIdSchema,
    query: PaginationParams.extend(SearchSchema.shape),
  },
  responses: {
    200: {
      description: "List of invitations for a course",
      content: { "application/json": { schema: PaginatedCourseInvitationsSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// DELETE /invitations/:id → revoke a pending invitation (creator only)
registry.registerPath({
  method: "delete",
  path: "/v1/invitations/{id}",
  operationId: "revokeInvitation",
  tags: ["Invitations"],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsIdSchema,
  },
  responses: {
    200: {
      description: "Invitation revoked",
      content: { "application/json": { schema: CourseInvitationSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// POST /invitations/:token/accept → accept an invitation and enroll the current user
registry.registerPath({
  method: "post",
  path: "/v1/invitations/{token}/accept",
  operationId: "acceptInvitation",
  tags: ["Invitations"],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsTokenSchema,
  },
  responses: {
    200: {
      description: "Invitation accepted, current user enrolled in the course",
      content: {
        "application/json": {
          schema: z.object({
            enrolled: z.literal(true),
            course: z.object({ publicId: z.string() }),
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
