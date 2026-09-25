"use client";

import { useSyncExternalStore } from "react";
import { notificationsService } from "@/services/notifications-service";

export type NotificationPermissionStatus = NotificationPermission | "unsupported";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): NotificationPermissionStatus {
  return notificationsService.isSupported() ? Notification.permission : "unsupported";
}

/** This device's browser notification permission; `null` until known on the client. */
export function useNotificationPermission() {
  const status = useSyncExternalStore<NotificationPermissionStatus | null>(
    subscribe,
    getSnapshot,
    () => null
  );

  async function request() {
    await Notification.requestPermission();
    listeners.forEach((listener) => listener());
  }

  return { status, request };
}
