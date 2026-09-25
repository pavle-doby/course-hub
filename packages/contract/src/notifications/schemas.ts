import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { notificationCategoryEnum, notifications } from "@repo/db-schema";

const PushSubscriptionSchema = z.object({
  endpoint: z.url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const NotificationCategorySchema = z.enum(notificationCategoryEnum.enumValues);

// Omitting `courseId` targets all courses (Settings). `subscription` is omitted when this device
// can't receive push; the opt-in still records in-app notification history.
export const SubscribeNotificationsBodySchema = z.object({
  courseId: z.uuid().optional(),
  category: NotificationCategorySchema,
  subscription: PushSubscriptionSchema.optional(),
});

// Omitting `courseId` turns the category off everywhere, including per-course opt-ins.
export const UnsubscribeNotificationsBodySchema = z.object({
  courseId: z.uuid().optional(),
  category: NotificationCategorySchema,
  subscription: PushSubscriptionSchema.pick({ endpoint: true }).optional(),
});

// Categories the user enabled for all courses.
export const NotificationPreferencesSchema = z.object({
  categories: z.array(NotificationCategorySchema),
});

export const NotificationItemSchema = createSelectSchema(notifications).omit({ userId: true });
