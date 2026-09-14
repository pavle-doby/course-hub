import { registry } from "api/openapi/registry";
import {
  ApiErrorSchema,
  CloudflareStreamWebhookSchema,
  CompleteVideoUploadParamsSchema,
  ParamsIdSchema,
  VideoParentParamsSchema,
  VideoUploadBodySchema,
  VideoUploadResponseSchema,
} from "@repo/contract";
import { VideoEditorSchema as VideoEditorOpenapiSchema } from "api/openapi/schemas";

registry.registerPath({
  method: "get",
  path: "/v1/videos/{parentType}/{parentId}",
  operationId: "getVideoByParent",
  tags: ["Videos"],
  request: { params: VideoParentParamsSchema },
  responses: {
    200: {
      description: "Video for the selected course content",
      content: { "application/json": { schema: VideoEditorOpenapiSchema.nullable() } },
    },
    default: { description: "Error", content: { "application/json": { schema: ApiErrorSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/v1/videos/uploads",
  operationId: "initializeVideoUpload",
  tags: ["Videos"],
  request: { body: { content: { "application/json": { schema: VideoUploadBodySchema } } } },
  responses: {
    201: {
      description: "Direct upload initialized",
      content: { "application/json": { schema: VideoUploadResponseSchema } },
    },
    default: { description: "Error", content: { "application/json": { schema: ApiErrorSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/v1/videos/uploads/{id}/complete",
  operationId: "completeVideoUpload",
  tags: ["Videos"],
  request: { params: CompleteVideoUploadParamsSchema },
  responses: {
    204: { description: "Video upload completed" },
    default: { description: "Error", content: { "application/json": { schema: ApiErrorSchema } } },
  },
});

registry.registerPath({
  method: "delete",
  path: "/v1/videos/{id}",
  operationId: "deleteVideo",
  tags: ["Videos"],
  request: { params: ParamsIdSchema },
  responses: {
    204: { description: "Video deleted" },
    default: { description: "Error", content: { "application/json": { schema: ApiErrorSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/v1/videos/webhook",
  operationId: "handleVideoWebhook",
  tags: ["Videos"],
  security: [],
  request: {
    body: {
      content: { "application/json": { schema: CloudflareStreamWebhookSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Webhook received",
    },
  },
});
