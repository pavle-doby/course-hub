import { registry } from "api/openapi/registry";
import { PaginationParams } from "api/middleware/pagination";
import { GetNotificationsResSchema, NotificationPreferencesSchema } from "api/openapi/schemas";
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

// GET /notifications → paginated notification history for the current user
registry.registerPath({
  method: "get",
  path: "/v1/notifications",
  operationId: "getNotifications",
  tags: ["Notifications"],
  security: [{ bearerAuth: [] }],
  request: { query: PaginationParams },
  responses: {
    200: {
      description: "Paginated notification history, newest first, with the unread count",
      content: { "application/json": { schema: GetNotificationsResSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// POST /notifications/read → mark all of the current user's notifications read
registry.registerPath({
  method: "post",
  path: "/v1/notifications/read",
  operationId: "markNotificationsRead",
  tags: ["Notifications"],
  security: [{ bearerAuth: [] }],
  responses: {
    204: { description: "All notifications marked read" },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});

// GET /notifications/preferences → categories the current user enabled for all courses
registry.registerPath({
  method: "get",
  path: "/v1/notifications/preferences",
  operationId: "getNotificationPreferences",
  tags: ["Notifications"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Notification categories enabled for all courses",
      content: { "application/json": { schema: NotificationPreferencesSchema } },
    },
    default: {
      description: "Error",
      content: { "application/json": { schema: ApiErrorSchema } },
    },
  },
});
