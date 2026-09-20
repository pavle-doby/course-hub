import { registry } from "api/openapi/registry";
import { CourseSchema, PaginatedCoursesSchema } from "api/openapi/schemas";
import {
  CourseGetAllQuerySchema,
  CoursePostQuerySchema,
  CoursePutQuerySchema,
  CourseThumbnailUploadBodySchema,
  CourseThumbnailUploadCompleteBodySchema,
  CourseThumbnailUploadResponseSchema,
} from "@repo/contract";
import { ParamsIdSchema, ParamsPublicIdSchema, SearchSchema, ApiErrorSchema } from "@repo/contract";
import { PaginationParams } from "api/middleware/pagination";

// GET /courses
registry.registerPath({
  method: "get",
  path: "/v1/courses",
  operationId: "getCourses",
  tags: ["Courses"],
  security: [{ bearerAuth: [] }],
  request: {
    query: PaginationParams.extend(SearchSchema.shape).extend(CourseGetAllQuerySchema.shape),
  },
  responses: {
    200: {
      description: "Paginated list of courses",
      content: { "application/json": { schema: PaginatedCoursesSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// POST /courses/thumbnails/uploads
registry.registerPath({
  method: "post",
  path: "/v1/courses/thumbnails/uploads",
  operationId: "initializeCourseThumbnailUpload",
  tags: ["Courses"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CourseThumbnailUploadBodySchema } } },
  },
  responses: {
    201: {
      description: "Direct thumbnail upload initialized",
      content: { "application/json": { schema: CourseThumbnailUploadResponseSchema } },
    },
    default: { description: "Error", content: { "application/json": { schema: ApiErrorSchema } } },
  },
});

// POST /courses/thumbnails/uploads/complete
registry.registerPath({
  method: "post",
  path: "/v1/courses/thumbnails/uploads/complete",
  operationId: "completeCourseThumbnailUpload",
  tags: ["Courses"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CourseThumbnailUploadCompleteBodySchema } } },
  },
  responses: {
    204: { description: "Course thumbnail saved" },
    default: { description: "Error", content: { "application/json": { schema: ApiErrorSchema } } },
  },
});

// DELETE /courses/:id/thumbnail
registry.registerPath({
  method: "delete",
  path: "/v1/courses/{id}/thumbnail",
  operationId: "deleteCourseThumbnail",
  tags: ["Courses"],
  security: [{ bearerAuth: [] }],
  request: { params: ParamsIdSchema },
  responses: {
    204: { description: "Course thumbnail removed" },
    default: { description: "Error", content: { "application/json": { schema: ApiErrorSchema } } },
  },
});

// GET /courses/:publicId
registry.registerPath({
  method: "get",
  path: "/v1/courses/{publicId}",
  operationId: "getCourseByPublicId",
  tags: ["Courses"],
  security: [{ bearerAuth: [] }],
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

// POST /courses
registry.registerPath({
  method: "post",
  path: "/v1/courses",
  operationId: "createCourse",
  tags: ["Courses"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CoursePostQuerySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Course created",
      content: { "application/json": { schema: CourseSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// PUT /courses/:id
registry.registerPath({
  method: "put",
  path: "/v1/courses/{id}",
  operationId: "updateCourse",
  tags: ["Courses"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ParamsIdSchema,
    body: {
      content: { "application/json": { schema: CoursePutQuerySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Course updated",
      content: { "application/json": { schema: CourseSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// DELETE /courses/:id
registry.registerPath({
  method: "delete",
  path: "/v1/courses/{id}",
  operationId: "deleteCourse",
  tags: ["Courses"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ParamsIdSchema,
  },
  responses: {
    200: {
      description: "Course deleted",
      content: { "application/json": { schema: CourseSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});
