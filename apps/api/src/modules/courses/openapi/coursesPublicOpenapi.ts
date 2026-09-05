import z from "zod";
import { registry } from "api/openapi/registry";
import {
  CourseSchema,
  PaginatedCoursesSchema,
  PublicTopicSchema,
  PublicLessonSchema,
} from "api/openapi/schemas";
import { ParamsPublicIdSchema, SearchSchema, ApiErrorSchema } from "@repo/contract";
import { PaginationParams } from "api/middleware/pagination";

// GET /public/courses (public, no auth required, published courses only)
registry.registerPath({
  method: "get",
  path: "/v1/public/courses",
  operationId: "getPublicCourses",
  tags: ["Courses"],
  security: [],
  request: {
    query: PaginationParams.extend(SearchSchema.shape),
  },
  responses: {
    200: {
      description: "Paginated list of published courses",
      content: { "application/json": { schema: PaginatedCoursesSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// GET /public/courses/:publicId (public, no auth required)
registry.registerPath({
  method: "get",
  path: "/v1/public/courses/{publicId}",
  operationId: "getPublicCourseByPublicId",
  tags: ["Courses"],
  security: [],
  request: {
    params: ParamsPublicIdSchema,
  },
  responses: {
    200: {
      description: "Course by public ID",
      content: { "application/json": { schema: CourseSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// GET /public/courses/:publicId/topics (public, no auth required, course must be published)
registry.registerPath({
  method: "get",
  path: "/v1/public/courses/{publicId}/topics",
  operationId: "getPublicCourseTopics",
  tags: ["Courses"],
  security: [],
  request: {
    params: ParamsPublicIdSchema,
  },
  responses: {
    200: {
      description: "Topic names of a published course (no description content)",
      content: { "application/json": { schema: z.array(PublicTopicSchema) } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// GET /public/courses/:publicId/lessons (public, no auth required, course must be published)
registry.registerPath({
  method: "get",
  path: "/v1/public/courses/{publicId}/lessons",
  operationId: "getPublicCourseLessons",
  tags: ["Courses"],
  security: [],
  request: {
    params: ParamsPublicIdSchema,
  },
  responses: {
    200: {
      description: "Lesson names of a published course (no description content)",
      content: { "application/json": { schema: z.array(PublicLessonSchema) } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});
