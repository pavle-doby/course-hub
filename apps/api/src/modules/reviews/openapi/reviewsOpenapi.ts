import { registry } from "api/openapi/registry";
import { CourseReviewSchema, MyCourseReviewSchema } from "api/openapi/schemas";
import {
  ApiErrorSchema,
  ParamsPublicIdSchema,
  ReviewParamsSchema,
  SaveCourseReviewBodySchema,
  SaveReviewReplyBodySchema,
} from "@repo/contract";

// GET /reviews/courses/:publicId/me → current user's review, or null
registry.registerPath({
  method: "get",
  path: "/v1/reviews/courses/{publicId}/me",
  operationId: "getMyCourseReview",
  tags: ["Reviews"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ParamsPublicIdSchema,
  },
  responses: {
    200: {
      description: "The current user's review, or null",
      content: { "application/json": { schema: MyCourseReviewSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// PUT /reviews/courses/:publicId → create or replace the current user's review
registry.registerPath({
  method: "put",
  path: "/v1/reviews/courses/{publicId}",
  operationId: "saveCourseReview",
  tags: ["Reviews"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ParamsPublicIdSchema,
    body: {
      content: { "application/json": { schema: SaveCourseReviewBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Saved review",
      content: { "application/json": { schema: CourseReviewSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// PUT /reviews/:reviewId/reply → course creator sets or clears their reply to a review
registry.registerPath({
  method: "put",
  path: "/v1/reviews/{reviewId}/reply",
  operationId: "saveReviewReply",
  tags: ["Reviews"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ReviewParamsSchema,
    body: {
      content: { "application/json": { schema: SaveReviewReplyBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Review with the saved reply",
      content: { "application/json": { schema: CourseReviewSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});
