import webpush from "web-push";
import type { CourseEntity } from "@repo/db-schema";
import type {
  GetNotificationPreferencesRes,
  GetNotificationsReq,
  GetNotificationsRes,
  SubscribeNotificationsReq,
  UnsubscribeNotificationsReq,
} from "@repo/contract";
import { resources } from "@repo/i18n/resources";
import { env } from "api/env";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import type { PaginationReqExtended } from "api/middleware/pagination";
import {
  notificationsRepository,
  type NotificationRecipient,
} from "../repository/notificationsRepository";

webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

type PushPayload = { title: string; body: string; url: string };
type NotificationCourse = Pick<CourseEntity, "id" | "creatorId" | "name" | "publicId">;
type NotificationCategory = SubscribeNotificationsReq["category"];
type PushRecipient = NotificationRecipient & { endpoint: string; p256dh: string; auth: string };
type PushNotification = keyof (typeof resources)["sr"]["common"]["notifications"]["push"];

function getPayload(
  language: string,
  notification: PushNotification,
  course: NotificationCourse,
  email?: string
): PushPayload {
  const message =
    resources[language === "en" ? "en" : "sr"].common.notifications.push[notification];
  return {
    title: message.title,
    body: message.body.replace("{{courseName}}", course.name).replace("{{email}}", email ?? ""),
    url: `/learn/${course.publicId}`,
  };
}

// Persists one history row per recipient user, then pushes to each of their live subscriptions.
async function send({
  recipients,
  category,
  course,
  payload,
}: {
  recipients: NotificationRecipient[];
  category: NotificationCategory;
  course: NotificationCourse;
  payload: (language: string) => PushPayload;
}): Promise<void> {
  const users = new Map(recipients.map((recipient) => [recipient.userId, recipient.language]));
  await notificationsRepository.insertNotifications(
    [...users].map(([userId, language]) => ({
      userId,
      category,
      courseId: course.id,
      ...payload(language),
    }))
  );

  const subscriptions = recipients.filter(
    (recipient): recipient is PushRecipient =>
      !!recipient.endpoint && !!recipient.p256dh && !!recipient.auth
  );
  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify(payload(subscription.language))
      )
    )
  );
  await Promise.all(
    results.map(async (result, index) => {
      if (
        result.status === "rejected" &&
        (result.reason.statusCode === 404 || result.reason.statusCode === 410)
      ) {
        await notificationsRepository.deleteSubscriptionByEndpoint(subscriptions[index]!.endpoint);
      }
    })
  );
}

export const notificationsService = {
  subscribe: async (authUserId: string, dto: SubscribeNotificationsReq): Promise<void> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) {
      return;
    }
    if (dto.subscription) {
      await notificationsRepository.upsertSubscription(user.id, dto.subscription);
    }
    await notificationsRepository.createPreference(user.id, dto);
  },

  unsubscribe: async (authUserId: string, dto: UnsubscribeNotificationsReq): Promise<void> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) {
      return;
    }
    await notificationsRepository.deletePreference(user.id, dto);
    if (dto.subscription && !(await notificationsRepository.hasPreferences(user.id))) {
      await notificationsRepository.deleteSubscription(user.id, dto.subscription.endpoint);
    }
  },

  getPreferences: async (authUserId: string): Promise<GetNotificationPreferencesRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) {
      return { categories: [] };
    }
    return await notificationsRepository.getAllCoursesCategories(user.id);
  },

  getNotifications: async (
    authUserId: string,
    dto: GetNotificationsReq<PaginationReqExtended>
  ): Promise<GetNotificationsRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) {
      return { data: [], pagination: { total: 0, page: dto.page, limit: 0 }, unreadCount: 0 };
    }
    return await notificationsRepository.getNotifications(user.id, dto);
  },

  markAllRead: async (authUserId: string): Promise<void> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) {
      return;
    }
    await notificationsRepository.markAllRead(user.id);
  },

  notifyCourseEnrolled: async (course: NotificationCourse, email: string): Promise<void> => {
    const category = "course_enrolled";
    const recipients = await notificationsRepository.getCourseRecipients(course, category);
    const payload = (language: string) => getPayload(language, "courseEnrolled", course, email);
    await send({ recipients, category, course, payload });
  },

  // ponytail: completions reuse the creator's `course_enrolled` opt-in (learner activity on the
  // course) instead of a new category, which would need a DB enum migration.
  notifyCourseCompleted: async (course: NotificationCourse, email: string): Promise<void> => {
    const category = "course_enrolled";
    const recipients = await notificationsRepository.getCourseRecipients(course, category);
    const payload = (language: string) => getPayload(language, "courseCompleted", course, email);
    await send({ recipients, category, course, payload });
  },

  notifyPrivateCourseAttempt: async (course: NotificationCourse, email: string): Promise<void> => {
    const category = "private_course_attempt";
    const recipients = await notificationsRepository.getCourseRecipients(course, category);
    const payload = (language: string) =>
      getPayload(language, "privateCourseAttempt", course, email);
    await send({ recipients, category, course, payload });
  },

  notifyCourseUpdated: async (course: NotificationCourse): Promise<void> => {
    const category = "course_updated";
    const recipients = await notificationsRepository.getCourseRecipients(course, category);
    const payload = (language: string) => getPayload(language, "courseUpdated", course);
    await send({ recipients, category, course, payload });
  },

  notifyCreatorNewCourse: async (course: NotificationCourse): Promise<void> => {
    const category = "creator_new_course";
    const recipients = await notificationsRepository.getCreatorRecipients(course.creatorId);
    const payload = (language: string) => getPayload(language, "creatorNewCourse", course);
    await send({ recipients, category, course, payload });
  },
};
