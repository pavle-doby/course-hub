import { registry } from "api/openapi/registry";
import { ApiErrorSchema, CloudflareStreamWebhookSchema } from "@repo/contract";

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
