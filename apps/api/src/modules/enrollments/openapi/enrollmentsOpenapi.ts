import z from "zod";
import { registry } from "api/openapi/registry";
import {
  TopicSchema,
  LessonSchema,
  CourseEnrollmentSchema,
  PaginatedCoursesSchema,
} from "api/openapi/schemas";
import {
  EnrollCourseBodySchema,
  ParamsPublicIdSchema,
  SearchSchema,
  ApiErrorSchema,
} from "@repo/contract";
import { PaginationParams } from "api/middleware/pagination";

// POST /enrollments → enroll current user into a published course
registry.registerPath({
  method: "post",
  path: "/v1/enrollments",
  operationId: "enrollInCourse",
  tags: ["Enrollments"],
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: EnrollCourseBodySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Enrolled in course",
      content: { "application/json": { schema: CourseEnrollmentSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// GET /enrollments/courses/:publicId → is current user enrolled in this course
registry.registerPath({
  method: "get",
  path: "/v1/enrollments/courses/{publicId}",
  operationId: "getEnrollmentStatus",
  tags: ["Enrollments"],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsPublicIdSchema,
  },
  responses: {
    200: {
      description: "Enrollment status for current user",
      content: { "application/json": { schema: z.object({ enrolled: z.boolean() }) } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// DELETE /enrollments/courses/:publicId → withdraw current user from an enrolled course
registry.registerPath({
  method: "delete",
  path: "/v1/enrollments/courses/{publicId}",
  operationId: "withdrawFromCourse",
  tags: ["Enrollments"],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsPublicIdSchema,
  },
  responses: {
    200: {
      description: "Withdrawn from course",
      content: { "application/json": { schema: CourseEnrollmentSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// GET /enrollments/courses/:publicId/topics → full topics, requires enrollment
registry.registerPath({
  method: "get",
  path: "/v1/enrollments/courses/{publicId}/topics",
  operationId: "getEnrolledCourseTopics",
  tags: ["Enrollments"],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsPublicIdSchema,
  },
  responses: {
    200: {
      description: "Full topics for an enrolled course",
      content: { "application/json": { schema: z.array(TopicSchema) } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// GET /enrollments/courses/:publicId/lessons → full lessons, requires enrollment
registry.registerPath({
  method: "get",
  path: "/v1/enrollments/courses/{publicId}/lessons",
  operationId: "getEnrolledCourseLessons",
  tags: ["Enrollments"],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsPublicIdSchema,
  },
  responses: {
    200: {
      description: "Full lessons for an enrolled course",
      content: { "application/json": { schema: z.array(LessonSchema) } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// GET /enrollments/courses → courses current user is enrolled in
registry.registerPath({
  method: "get",
  path: "/v1/enrollments/courses",
  operationId: "getEnrolledCourses",
  tags: ["Enrollments"],
  security: [{ cookieAuth: [] }],
  request: {
    query: PaginationParams.extend(SearchSchema.shape),
  },
  responses: {
    200: {
      description: "Paginated list of courses the current user is enrolled in",
      content: { "application/json": { schema: PaginatedCoursesSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});
