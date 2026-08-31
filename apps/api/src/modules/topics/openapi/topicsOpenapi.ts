import { registry } from "api/openapi/registry";
import { TopicSchema, PaginatedTopicsSchema } from "api/openapi/schemas";
import { TopicGetAllQuerySchema, TopicPostQuerySchema, TopicPutQuerySchema } from "@repo/contract";
import { ParamsIdSchema, SearchSchema, ApiErrorSchema } from "@repo/contract";
import { PaginationParams } from "api/middleware/pagination";

// GET /topics
registry.registerPath({
  method: "get",
  path: "/v1/topics",
  operationId: "getTopics",
  tags: ["Topics"],
  security: [{ cookieAuth: [] }],
  request: {
    query: PaginationParams.extend(SearchSchema.shape).extend(TopicGetAllQuerySchema.shape),
  },
  responses: {
    200: {
      description: "Paginated list of topics",
      content: { "application/json": { schema: PaginatedTopicsSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// GET /topics/:id
registry.registerPath({
  method: "get",
  path: "/v1/topics/{id}",
  operationId: "getTopic",
  tags: ["Topics"],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsIdSchema,
  },
  responses: {
    200: {
      description: "Topic by ID",
      content: { "application/json": { schema: TopicSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// POST /topics
registry.registerPath({
  method: "post",
  path: "/v1/topics",
  operationId: "createTopic",
  tags: ["Topics"],
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: TopicPostQuerySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Topic created",
      content: { "application/json": { schema: TopicSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// PUT /topics/:id
registry.registerPath({
  method: "put",
  path: "/v1/topics/{id}",
  operationId: "updateTopic",
  tags: ["Topics"],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsIdSchema,
    body: {
      content: { "application/json": { schema: TopicPutQuerySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Topic updated",
      content: { "application/json": { schema: TopicSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// DELETE /topics/:id
registry.registerPath({
  method: "delete",
  path: "/v1/topics/{id}",
  operationId: "deleteTopic",
  tags: ["Topics"],
  security: [{ cookieAuth: [] }],
  request: {
    params: ParamsIdSchema,
  },
  responses: {
    200: {
      description: "Topic deleted",
      content: { "application/json": { schema: TopicSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});
