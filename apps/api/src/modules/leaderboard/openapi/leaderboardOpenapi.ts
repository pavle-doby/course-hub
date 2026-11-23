import { registry } from "api/openapi/registry";
import { CourseLeaderboardSchema, MyLeaderboardNearbySchema } from "api/openapi/schemas";
import { ApiErrorSchema, ParamsPublicIdSchema } from "@repo/contract";
import { PaginationParams } from "api/middleware/pagination";

// GET /leaderboard/courses/:publicId → ranked learners of a course, creator or enrolled learners only
registry.registerPath({
  method: "get",
  path: "/v1/leaderboard/courses/{publicId}",
  operationId: "getCourseLeaderboard",
  tags: ["Leaderboard"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ParamsPublicIdSchema,
    query: PaginationParams,
  },
  responses: {
    200: {
      description: "Paginated leaderboard plus the current learner's entry",
      content: { "application/json": { schema: CourseLeaderboardSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// GET /leaderboard/courses/:publicId/me → current learner's entry and the learners around it
registry.registerPath({
  method: "get",
  path: "/v1/leaderboard/courses/{publicId}/me",
  operationId: "getMyLeaderboardNearby",
  tags: ["Leaderboard"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ParamsPublicIdSchema,
  },
  responses: {
    200: {
      description: "The current learner's entry with up to two learners above and below",
      content: { "application/json": { schema: MyLeaderboardNearbySchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});
