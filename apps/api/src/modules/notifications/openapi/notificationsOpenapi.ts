import { registry } from "api/openapi/registry";
import {
  ApiErrorSchema,
  SubscribeNotificationsBodySchema,
  UnsubscribeNotificationsBodySchema,
} from "@repo/contract";

for (const [method, operationId, schema] of [
  ["post", "subscribeNotifications", SubscribeNotificationsBodySchema],
  ["delete", "unsubscribeNotifications", UnsubscribeNotificationsBodySchema],
] as const) {
  registry.registerPath({
    method,
    path: "/v1/notifications/subscribe",
    operationId,
    tags: ["Notifications"],
    security: [{ bearerAuth: [] }],
    request: { body: { content: { "application/json": { schema } }, required: true } },
    responses: {
      204: { description: "Notification subscription updated" },
      default: {
        description: "Error",
        content: { "application/json": { schema: ApiErrorSchema } },
      },
    },
  });
}
