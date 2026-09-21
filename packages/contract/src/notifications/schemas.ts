import { z } from "zod";
import { notificationCategoryEnum } from "@repo/db-schema";

const PushSubscriptionSchema = z.object({
  endpoint: z.url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export const SubscribeNotificationsBodySchema = z.object({
  courseId: z.uuid(),
  category: z.enum(notificationCategoryEnum.enumValues),
  subscription: PushSubscriptionSchema,
});

export const UnsubscribeNotificationsBodySchema = z.object({
  courseId: z.uuid(),
  category: z.enum(notificationCategoryEnum.enumValues),
  subscription: PushSubscriptionSchema.pick({ endpoint: true }),
});
