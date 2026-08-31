import { registry } from "api/openapi/registry";
import { LessonSchema, PaginatedLessonsSchema } from "api/openapi/schemas";
import {
  LessonGetAllQuerySchema,
  LessonPostQuerySchema,
  LessonPutQuerySchema,
} from "@repo/contract";
import { ParamsIdSchema, SearchSchema, ApiErrorSchema } from "@repo/contract";
import { PaginationParams } from "api/middleware/pagination";

// GET /lessons
registry.registerPath({
  method: "get",
  path: "/v1/lessons",
  operationId: "getLessons",
  tags: ["Lessons"],
  security: [{ cookieAuth: [] }],
  request: {
    query: PaginationParams.extend(SearchSchema.shape).extend(LessonGetAllQuerySchema.shape),
  },
  responses: {
    200: {
      description: "Paginated list of lessons",
      content: { "application/json": { schema: PaginatedLessonsSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// GET /lessons/:id
registry.registerPath({
  method: "get",
  path: "/v1/lessons/{id}",
  operationId: "getLesson",
  tags: ["Lessons"],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsIdSchema,
  },
  responses: {
    200: {
      description: "Lesson by ID",
      content: { "application/json": { schema: LessonSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// POST /lessons
registry.registerPath({
  method: "post",
  path: "/v1/lessons",
  operationId: "createLesson",
  tags: ["Lessons"],
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: LessonPostQuerySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Lesson created",
      content: { "application/json": { schema: LessonSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// PUT /lessons/:id
registry.registerPath({
  method: "put",
  path: "/v1/lessons/{id}",
  operationId: "updateLesson",
  tags: ["Lessons"],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsIdSchema,
    body: {
      content: { "application/json": { schema: LessonPutQuerySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Lesson updated",
      content: { "application/json": { schema: LessonSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// DELETE /lessons/:id
registry.registerPath({
  method: "delete",
  path: "/v1/lessons/{id}",
  operationId: "deleteLesson",
  tags: ["Lessons"],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsIdSchema,
  },
  responses: {
    200: {
      description: "Lesson deleted",
      content: { "application/json": { schema: LessonSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});
