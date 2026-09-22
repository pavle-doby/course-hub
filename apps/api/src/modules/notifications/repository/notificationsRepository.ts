import { and, eq, isNull, sql } from "drizzle-orm";
import { db, schema } from "@repo/db";
import type { SubscribeNotificationsReq, UnsubscribeNotificationsReq } from "@repo/contract";

export const notificationsRepository = {
  upsertSubscription: async (
    userId: string,
    subscription: SubscribeNotificationsReq["subscription"]
  ): Promise<void> => {
    await db
      .insert(schema.pushSubscriptions)
      .values({
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      })
      .onConflictDoUpdate({
        target: schema.pushSubscriptions.endpoint,
        set: {
          userId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updatedAt: new Date(),
        },
      });
  },

  createPreference: async (userId: string, dto: SubscribeNotificationsReq): Promise<void> => {
    await db
      .insert(schema.notificationPreferences)
      .values({ userId, courseId: dto.courseId, category: dto.category })
      .onConflictDoNothing();
  },

  deletePreference: async (userId: string, dto: UnsubscribeNotificationsReq): Promise<void> => {
    await db
      .delete(schema.notificationPreferences)
      .where(
        and(
          eq(schema.notificationPreferences.userId, userId),
          eq(schema.notificationPreferences.courseId, dto.courseId),
          eq(schema.notificationPreferences.category, dto.category)
        )
      );
  },

  hasPreferences: async (userId: string): Promise<boolean> => {
    const preference = await db.query.notificationPreferences.findFirst({
      where: eq(schema.notificationPreferences.userId, userId),
      columns: { id: true },
    });
    return !!preference;
  },

  deleteSubscription: async (userId: string, endpoint: string): Promise<void> => {
    await db
      .delete(schema.pushSubscriptions)
      .where(
        and(
          eq(schema.pushSubscriptions.userId, userId),
          eq(schema.pushSubscriptions.endpoint, endpoint)
        )
      );
  },

  deleteSubscriptionByEndpoint: async (endpoint: string): Promise<void> => {
    await db
      .delete(schema.pushSubscriptions)
      .where(eq(schema.pushSubscriptions.endpoint, endpoint));
  },

  getCourseRecipients: async (
    courseId: string,
    category: SubscribeNotificationsReq["category"]
  ): Promise<{ endpoint: string; p256dh: string; auth: string; language: string }[]> => {
    return await db
      .select({
        endpoint: schema.pushSubscriptions.endpoint,
        p256dh: schema.pushSubscriptions.p256dh,
        auth: schema.pushSubscriptions.auth,
        language: sql<string>`coalesce(${schema.userPreferences.language}, 'sr')`,
      })
      .from(schema.notificationPreferences)
      .innerJoin(
        schema.pushSubscriptions,
        eq(schema.notificationPreferences.userId, schema.pushSubscriptions.userId)
      )
      .leftJoin(
        schema.userPreferences,
        eq(schema.notificationPreferences.userId, schema.userPreferences.userId)
      )
      .where(
        and(
          eq(schema.notificationPreferences.courseId, courseId),
          eq(schema.notificationPreferences.category, category)
        )
      );
  },

  getCreatorRecipients: async (
    creatorId: string
  ): Promise<{ endpoint: string; p256dh: string; auth: string; language: string }[]> => {
    return await db
      .selectDistinct({
        endpoint: schema.pushSubscriptions.endpoint,
        p256dh: schema.pushSubscriptions.p256dh,
        auth: schema.pushSubscriptions.auth,
        language: sql<string>`coalesce(${schema.userPreferences.language}, 'sr')`,
      })
      .from(schema.notificationPreferences)
      .innerJoin(
        schema.courseEnrollments,
        and(
          eq(schema.notificationPreferences.userId, schema.courseEnrollments.userId),
          eq(schema.notificationPreferences.courseId, schema.courseEnrollments.courseId),
          isNull(schema.courseEnrollments.withdrawnAt)
        )
      )
      .innerJoin(schema.courses, eq(schema.notificationPreferences.courseId, schema.courses.id))
      .innerJoin(
        schema.pushSubscriptions,
        eq(schema.notificationPreferences.userId, schema.pushSubscriptions.userId)
      )
      .leftJoin(
        schema.userPreferences,
        eq(schema.notificationPreferences.userId, schema.userPreferences.userId)
      )
      .where(
        and(
          eq(schema.courses.creatorId, creatorId),
          eq(schema.notificationPreferences.category, "creator_new_course")
        )
      );
  },
};
