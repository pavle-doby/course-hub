import type {
  SubscribeNotificationsBodyCategory,
  SubscribeNotificationsMutationVariables,
  UnsubscribeNotificationsMutationVariables,
} from "@repo/api-client";
import { env } from "@repo/api-client/env";

const CREATOR_DISMISSED_KEY = "notifications:creator";

type PushSubscriptionData = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

type SubscribeNotifications = (
  variables: SubscribeNotificationsMutationVariables
) => Promise<unknown>;

type UnsubscribeNotifications = (
  variables: UnsubscribeNotificationsMutationVariables
) => Promise<unknown>;

function urlBase64ToUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const base64 = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

function isSupported(): boolean {
  return (
    !!env.VAPID_PUBLIC_KEY &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function ensurePushSubscription(): Promise<PushSubscriptionData> {
  if (!env.VAPID_PUBLIC_KEY || !isSupported()) {
    throw new Error("Push notifications are not supported in this browser");
  }
  if ((await Notification.requestPermission()) !== "granted") {
    throw new Error("Notification permission was not granted");
  }
  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    await existingSubscription.unsubscribe();
  }
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(env.VAPID_PUBLIC_KEY),
  });
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("Could not read the push subscription");
  }
  return { endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } };
}

/** Omit `courseId` to opt in for all courses. */
async function send({
  courseId,
  categories,
  subscribeNotifications,
}: {
  courseId?: string;
  categories: SubscribeNotificationsBodyCategory[];
  subscribeNotifications: SubscribeNotifications;
}): Promise<void> {
  // Push is best-effort: without it the opt-in still lands in the in-app notification history.
  const subscription = await ensurePushSubscription().catch(() => undefined);

  await Promise.all(
    categories.map((category) =>
      subscribeNotifications({
        data: { courseId, category, subscription },
      })
    )
  );
}

async function enableCreatorNotifications({
  courseId,
  subscribeNotifications,
}: {
  courseId: string;
  subscribeNotifications: SubscribeNotifications;
}): Promise<void> {
  await send({
    courseId,
    categories: ["course_enrolled", "private_course_attempt"],
    subscribeNotifications,
  });
}

async function enableLearnerNotifications({
  courseId,
  subscribeNotifications,
}: {
  courseId: string;
  subscribeNotifications: SubscribeNotifications;
}): Promise<void> {
  await send({
    courseId,
    categories: ["course_updated", "creator_new_course"],
    subscribeNotifications,
  });
}

/** Turns a category off for all courses, including per-course opt-ins. */
async function disable({
  category,
  unsubscribeNotifications,
}: {
  category: SubscribeNotificationsBodyCategory;
  unsubscribeNotifications: UnsubscribeNotifications;
}): Promise<void> {
  const registration = isSupported() ? await navigator.serviceWorker.getRegistration() : undefined;
  const subscription = await registration?.pushManager.getSubscription();
  await unsubscribeNotifications({
    data: {
      category,
      subscription: subscription ? { endpoint: subscription.endpoint } : undefined,
    },
  });
}

function dismissCreatorPrompt(courseId: string): void {
  localStorage.setItem(`${CREATOR_DISMISSED_KEY}:${courseId}`, "1");
}

function isCreatorPromptDismissed(courseId: string): boolean {
  return localStorage.getItem(`${CREATOR_DISMISSED_KEY}:${courseId}`) !== null;
}

export const notificationsService = {
  isSupported,
  send,
  disable,
  enableCreatorNotifications,
  enableLearnerNotifications,
  isCreatorPromptDismissed,
  dismissCreatorPrompt,
};
