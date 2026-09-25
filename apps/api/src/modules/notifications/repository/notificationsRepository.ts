import { and, count, desc, eq, exists, isNull, or, sql } from "drizzle-orm";
import { db, schema } from "@repo/db";
import type { CourseEntity } from "@repo/db-schema";
import type {
  GetNotificationPreferencesRes,
  GetNotificationsReq,
  GetNotificationsRes,
  SubscribeNotificationsReq,
  UnsubscribeNotificationsReq,
} from "@repo/contract";
import type { PaginationReqExtended } from "api/middleware/pagination";

// One row per (opted-in user, push subscription); `endpoint` etc. are null for opted-in users
// without a live subscription, who still get history rows.
export type NotificationRecipient = {
  userId: string;
  language: string;
  endpoint: string | null;
  p256dh: string | null;
  auth: string | null;
};

type NotificationCategory = SubscribeNotificationsReq["category"];

const recipientColumns = {
  userId: schema.notificationPreferences.userId,
  language: sql<string>`coalesce(${schema.userPreferences.language}, 'sr')`,
  endpoint: schema.pushSubscriptions.endpoint,
  p256dh: schema.pushSubscriptions.p256dh,
  auth: schema.pushSubscriptions.auth,
};

export const notificationsRepository = {
  upsertSubscription: async (
    userId: string,
    subscription: NonNullable<SubscribeNotificationsReq["subscription"]>
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
      .values({ userId, courseId: dto.courseId ?? null, category: dto.category })
      .onConflictDoNothing();
  },

  deletePreference: async (userId: string, dto: UnsubscribeNotificationsReq): Promise<void> => {
    await db
      .delete(schema.notificationPreferences)
      .where(
        and(
          eq(schema.notificationPreferences.userId, userId),
          eq(schema.notificationPreferences.category, dto.category),
          dto.courseId ? eq(schema.notificationPreferences.courseId, dto.courseId) : undefined
        )
      );
  },

  getAllCoursesCategories: async (userId: string): Promise<GetNotificationPreferencesRes> => {
    const rows = await db
      .select({ category: schema.notificationPreferences.category })
      .from(schema.notificationPreferences)
      .where(
        and(
          eq(schema.notificationPreferences.userId, userId),
          isNull(schema.notificationPreferences.courseId)
        )
      );
    return { categories: rows.map((row) => row.category) };
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

  // Per-course opt-ins for this course, plus "all courses" opt-ins from users related to it:
  // the creator for creator categories, active enrollees for `course_updated`.
  getCourseRecipients: async (
    course: Pick<CourseEntity, "id" | "creatorId">,
    category: NotificationCategory
  ): Promise<NotificationRecipient[]> => {
    const preferences = schema.notificationPreferences;
    const allCoursesRelation =
      category === "course_updated"
        ? exists(
            db
              .select({ one: sql`1` })
              .from(schema.courseEnrollments)
              .where(
                and(
                  eq(schema.courseEnrollments.userId, preferences.userId),
                  eq(schema.courseEnrollments.courseId, course.id),
                  isNull(schema.courseEnrollments.withdrawnAt)
                )
              )
          )
        : eq(preferences.userId, course.creatorId);

    return await db
      .selectDistinct(recipientColumns)
      .from(preferences)
      .leftJoin(schema.pushSubscriptions, eq(preferences.userId, schema.pushSubscriptions.userId))
      .leftJoin(schema.userPreferences, eq(preferences.userId, schema.userPreferences.userId))
      .where(
        and(
          eq(preferences.category, category),
          or(
            eq(preferences.courseId, course.id),
            and(isNull(preferences.courseId), allCoursesRelation)
          )
        )
      );
  },

  // Active learners of any of the creator's courses, opted in on one of those courses or for all.
  getCreatorRecipients: async (creatorId: string): Promise<NotificationRecipient[]> => {
    const preferences = schema.notificationPreferences;
    return await db
      .selectDistinct(recipientColumns)
      .from(preferences)
      .leftJoin(schema.pushSubscriptions, eq(preferences.userId, schema.pushSubscriptions.userId))
      .leftJoin(schema.userPreferences, eq(preferences.userId, schema.userPreferences.userId))
      .where(
        and(
          eq(preferences.category, "creator_new_course"),
          exists(
            db
              .select({ one: sql`1` })
              .from(schema.courseEnrollments)
              .innerJoin(schema.courses, eq(schema.courseEnrollments.courseId, schema.courses.id))
              .where(
                and(
                  eq(schema.courseEnrollments.userId, preferences.userId),
                  eq(schema.courses.creatorId, creatorId),
                  isNull(schema.courseEnrollments.withdrawnAt),
                  or(
                    isNull(preferences.courseId),
                    eq(preferences.courseId, schema.courseEnrollments.courseId)
                  )
                )
              )
          )
        )
      );
  },

  insertNotifications: async (
    rows: (typeof schema.notifications.$inferInsert)[]
  ): Promise<void> => {
    if (!rows.length) {
      return;
    }
    await db.insert(schema.notifications).values(rows);
  },

  getNotifications: async (
    userId: string,
    { page, limit, offset }: GetNotificationsReq<PaginationReqExtended>
  ): Promise<GetNotificationsRes> => {
    const [counts] = await db
      .select({
        total: count(),
        unreadCount: count(sql`case when ${schema.notifications.readAt} is null then 1 end`),
      })
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId));
    const total = counts?.total ?? 0;

    const data = await db
      .select({
        id: schema.notifications.id,
        category: schema.notifications.category,
        courseId: schema.notifications.courseId,
        title: schema.notifications.title,
        body: schema.notifications.body,
        url: schema.notifications.url,
        readAt: schema.notifications.readAt,
        createdAt: schema.notifications.createdAt,
      })
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .orderBy(desc(schema.notifications.createdAt))
      .offset(offset ?? 0)
      .limit(limit ?? total);

    return {
      data,
      pagination: { total, page, limit: limit || total },
      unreadCount: counts?.unreadCount ?? 0,
    };
  },

  markAllRead: async (userId: string): Promise<void> => {
    await db
      .update(schema.notifications)
      .set({ readAt: new Date() })
      .where(and(eq(schema.notifications.userId, userId), isNull(schema.notifications.readAt)));
  },
};
