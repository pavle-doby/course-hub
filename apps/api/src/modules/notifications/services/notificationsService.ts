import webpush from "web-push";
import type { CourseEntity } from "@repo/db-schema";
import type { SubscribeNotificationsReq, UnsubscribeNotificationsReq } from "@repo/contract";
import { env } from "api/env";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { notificationsRepository } from "../repository/notificationsRepository";

webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

type PushPayload = { title: string; body: string; url: string };
type NotificationCourse = Pick<CourseEntity, "id" | "creatorId" | "name" | "publicId">;

async function send(
  recipients: { endpoint: string; p256dh: string; auth: string }[],
  payload: PushPayload
): Promise<void> {
  const results = await Promise.allSettled(
    recipients.map((subscription) =>
      webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify(payload)
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

  notifyCourseEnrolled: async (course: NotificationCourse): Promise<void> => {
    await send(await notificationsRepository.getCourseRecipients(course.id, "course_enrolled"), {
      title: "New course enrollment",
      body: `Someone enrolled in ${course.name}.`,
      url: `/learn/${course.publicId}`,
    });
  },

  notifyPrivateCourseAttempt: async (course: NotificationCourse): Promise<void> => {
    await send(
      await notificationsRepository.getCourseRecipients(course.id, "private_course_attempt"),
      {
        title: "Private course enrollment attempt",
        body: `Someone tried to enroll in ${course.name}.`,
        url: `/learn/${course.publicId}`,
      }
    );
  },

  notifyCourseUpdated: async (course: NotificationCourse): Promise<void> => {
    await send(await notificationsRepository.getCourseRecipients(course.id, "course_updated"), {
      title: "Course updated",
      body: `${course.name} has been updated.`,
      url: `/learn/${course.publicId}`,
    });
  },

  notifyCreatorNewCourse: async (course: NotificationCourse): Promise<void> => {
    await send(await notificationsRepository.getCreatorRecipients(course.creatorId), {
      title: "New course",
      body: `${course.name} is now available.`,
      url: `/learn/${course.publicId}`,
    });
  },
};
