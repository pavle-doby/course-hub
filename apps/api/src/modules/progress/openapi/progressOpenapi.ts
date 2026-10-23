import { registry } from "api/openapi/registry";
import { CourseProgressSchema, LessonProgressSchema } from "api/openapi/schemas";
import {
  ApiErrorSchema,
  LessonProgressParamsSchema,
  ParamsPublicIdSchema,
  TopicProgressParamsSchema,
  UpdateLessonProgressBodySchema,
  UpdateTopicProgressBodySchema,
} from "@repo/contract";

// GET /progress/courses/:publicId → current user's progress in an enrolled course
registry.registerPath({
  method: "get",
  path: "/v1/progress/courses/{publicId}",
  operationId: "getCourseProgress",
  tags: ["Progress"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ParamsPublicIdSchema,
  },
  responses: {
    200: {
      description: "Lesson, topic, and course status for the current user",
      content: { "application/json": { schema: CourseProgressSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// PUT /progress/lessons/:lessonId → set current user's lesson status and/or video position
registry.registerPath({
  method: "put",
  path: "/v1/progress/lessons/{lessonId}",
  operationId: "updateLessonProgress",
  tags: ["Progress"],
  security: [{ bearerAuth: [] }],
  request: {
    params: LessonProgressParamsSchema,
    body: {
      content: { "application/json": { schema: UpdateLessonProgressBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Updated lesson progress",
      content: { "application/json": { schema: LessonProgressSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// PUT /progress/topics/:topicId → mark the topic video as watched by the current user
registry.registerPath({
  method: "put",
  path: "/v1/progress/topics/{topicId}",
  operationId: "updateTopicProgress",
  tags: ["Progress"],
  security: [{ bearerAuth: [] }],
  request: {
    params: TopicProgressParamsSchema,
    body: {
      content: { "application/json": { schema: UpdateTopicProgressBodySchema } },
      required: true,
    },
  },
  responses: {
    204: {
      description: "Topic video marked as watched",
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});
