import webpush from "web-push";
import type { CourseEntity } from "@repo/db-schema";
import type { SubscribeNotificationsReq, UnsubscribeNotificationsReq } from "@repo/contract";
import { resources } from "@repo/i18n/resources";
import { env } from "api/env";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { notificationsRepository } from "../repository/notificationsRepository";

webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

type PushPayload = { title: string; body: string; url: string };
type NotificationCourse = Pick<CourseEntity, "id" | "creatorId" | "name" | "publicId">;
type PushRecipient = { endpoint: string; p256dh: string; auth: string; language: string };
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

async function send(
  recipients: PushRecipient[],
  payload: (language: string) => PushPayload
): Promise<void> {
  const results = await Promise.allSettled(
    recipients.map((subscription) =>
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
        await notificationsRepository.deleteSubscriptionByEndpoint(recipients[index]!.endpoint);
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
    await notificationsRepository.upsertSubscription(user.id, dto.subscription);
    await notificationsRepository.createPreference(user.id, dto);
  },

  unsubscribe: async (authUserId: string, dto: UnsubscribeNotificationsReq): Promise<void> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) {
      return;
    }
    await notificationsRepository.deletePreference(user.id, dto);
    if (!(await notificationsRepository.hasPreferences(user.id))) {
      await notificationsRepository.deleteSubscription(user.id, dto.subscription.endpoint);
    }
  },

  notifyCourseEnrolled: async (course: NotificationCourse, email: string): Promise<void> => {
    await send(
      await notificationsRepository.getCourseRecipients(course.id, "course_enrolled"),
      (language) => getPayload(language, "courseEnrolled", course, email)
    );
  },

  // ponytail: completions reuse the creator's `course_enrolled` opt-in (learner activity on the
  // course) instead of a new category, which would need a DB enum migration.
  notifyCourseCompleted: async (course: NotificationCourse, email: string): Promise<void> => {
    await send(
      await notificationsRepository.getCourseRecipients(course.id, "course_enrolled"),
      (language) => getPayload(language, "courseCompleted", course, email)
    );
  },

  notifyPrivateCourseAttempt: async (course: NotificationCourse, email: string): Promise<void> => {
    await send(
      await notificationsRepository.getCourseRecipients(course.id, "private_course_attempt"),
      (language) => getPayload(language, "privateCourseAttempt", course, email)
    );
  },

  notifyCourseUpdated: async (course: NotificationCourse): Promise<void> => {
    await send(
      await notificationsRepository.getCourseRecipients(course.id, "course_updated"),
      (language) => getPayload(language, "courseUpdated", course)
    );
  },

  notifyCreatorNewCourse: async (course: NotificationCourse): Promise<void> => {
    await send(await notificationsRepository.getCreatorRecipients(course.creatorId), (language) =>
      getPayload(language, "creatorNewCourse", course)
    );
  },
};
