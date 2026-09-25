import { z } from "zod";
import {
  NotificationItemSchema,
  NotificationPreferencesSchema,
  SubscribeNotificationsBodySchema,
  UnsubscribeNotificationsBodySchema,
} from "./schemas";
import type { PaginationReq, PaginationRes } from "../shared";

export type SubscribeNotificationsReq = z.infer<typeof SubscribeNotificationsBodySchema>;
export type UnsubscribeNotificationsReq = z.infer<typeof UnsubscribeNotificationsBodySchema>;
export type NotificationItem = z.infer<typeof NotificationItemSchema>;
export type GetNotificationsReq<Pagination = PaginationReq> = Pagination;
export type GetNotificationsRes = PaginationRes<NotificationItem> & { unreadCount: number };
export type GetNotificationPreferencesRes = z.infer<typeof NotificationPreferencesSchema>;
