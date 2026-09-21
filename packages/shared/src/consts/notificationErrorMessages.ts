import { ErrorCodeNotification } from "@repo/contract";

export const notificationErrorMessages = {
  [ErrorCodeNotification.SUBSCRIPTION_NOT_FOUND]: {
    title: "errors.notification.SUBSCRIPTION_NOT_FOUND.title",
    message: "errors.notification.SUBSCRIPTION_NOT_FOUND.message",
  },
} as const satisfies Record<ErrorCodeNotification, { title: string; message: string }>;
