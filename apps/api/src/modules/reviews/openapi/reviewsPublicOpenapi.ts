import { registry } from "api/openapi/registry";
import { PaginatedCourseReviewsSchema } from "api/openapi/schemas";
import { ApiErrorSchema, ParamsPublicIdSchema } from "@repo/contract";
import { PaginationParams } from "api/middleware/pagination";

// GET /public/reviews/courses/:publicId → paginated reviews, newest first, no auth required
registry.registerPath({
  method: "get",
  path: "/v1/public/reviews/courses/{publicId}",
  operationId: "getCourseReviews",
  tags: ["Reviews"],
  security: [],
  request: {
    params: ParamsPublicIdSchema,
    query: PaginationParams,
  },
  responses: {
    200: {
      description: "Paginated reviews for a published course",
      content: { "application/json": { schema: PaginatedCourseReviewsSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});
