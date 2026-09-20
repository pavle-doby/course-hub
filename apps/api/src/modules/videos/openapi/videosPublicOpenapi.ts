import { registry } from "api/openapi/registry";
import {
  ApiErrorSchema,
  CloudflareStreamWebhookSchema,
  VideoCourseParentParamsSchema,
} from "@repo/contract";
import { VideoEditorSchema as VideoEditorOpenapiSchema } from "api/openapi/schemas";

registry.registerPath({
  method: "get",
  path: "/v1/public/videos/{parentType}/{parentId}",
  operationId: "getPublicVideoByParent",
  tags: ["Videos"],
  security: [],
  request: { params: VideoCourseParentParamsSchema },
  responses: {
    200: {
      description: "Public course-scoped video",
      content: { "application/json": { schema: VideoEditorOpenapiSchema.nullable() } },
    },
    default: { description: "Error", content: { "application/json": { schema: ApiErrorSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/v1/public/videos/webhook",
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
    200: { description: "Webhook received" },
    default: { description: "Error", content: { "application/json": { schema: ApiErrorSchema } } },
  },
});
