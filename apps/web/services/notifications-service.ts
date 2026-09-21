import type {
  SubscribeNotificationsBodyCategory,
  SubscribeNotificationsMutationVariables,
} from "@repo/api-client";
import { env } from "@repo/api-client/env";

type PushSubscriptionData = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

type SubscribeNotifications = (
  variables: SubscribeNotificationsMutationVariables
) => Promise<unknown>;

function urlBase64ToUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const base64 = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

async function ensurePushSubscription(): Promise<PushSubscriptionData | null> {
  if (!env.VAPID_PUBLIC_KEY || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }
  if ((await Notification.requestPermission()) !== "granted") {
    return null;
  }
  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(env.VAPID_PUBLIC_KEY),
    }));
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    return null;
  }
  return { endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } };
}

async function send({
  courseId,
  categories,
  subscribeNotifications,
}: {
  courseId: string;
  categories: SubscribeNotificationsBodyCategory[];
  subscribeNotifications: SubscribeNotifications;
}): Promise<void> {
  const subscription = await ensurePushSubscription();
  if (!subscription) {
    return;
  }
  await Promise.all(
    categories.map((category) =>
      subscribeNotifications({ data: { courseId, category, subscription } })
    )
  ).catch(() => undefined);
}

async function promptCreatorNotifications({
  courseId,
  prompt,
  subscribeNotifications,
}: {
  courseId: string;
  prompt: string;
  subscribeNotifications: SubscribeNotifications;
}): Promise<void> {
  const dismissed = `notifications:creator:${courseId}`;
  if (localStorage.getItem(dismissed)) {
    return;
  }
  if (!window.confirm(prompt)) {
    localStorage.setItem(dismissed, "1");
    return;
  }
  await send({
    courseId,
    categories: ["course_enrolled", "private_course_attempt"],
    subscribeNotifications,
  });
}

async function promptLearnerNotifications({
  courseId,
  prompt,
  subscribeNotifications,
}: {
  courseId: string;
  prompt: string;
  subscribeNotifications: SubscribeNotifications;
}): Promise<void> {
  if (!window.confirm(prompt)) {
    return;
  }
  await send({
    courseId,
    categories: ["course_updated", "creator_new_course"],
    subscribeNotifications,
  });
}

export const notificationsService = {
  send,
  promptCreatorNotifications,
  promptLearnerNotifications,
};
