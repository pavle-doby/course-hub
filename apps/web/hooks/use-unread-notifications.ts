"use client";

import { useGetNotifications } from "@repo/api-client";

/** Query params for the unread-count query; also its cache key for invalidation. */
export const UNREAD_NOTIFICATIONS_PARAMS = { limit: 1 };

// Polled while the navigation is mounted; React Query pauses it while the tab is hidden and
// refetches on focus, so notifications that couldn't be pushed still surface in the app.
const REFETCH_INTERVAL_MS = 30_000;

export function useUnreadNotificationsCount(): number {
  const { data } = useGetNotifications(UNREAD_NOTIFICATIONS_PARAMS, {
    query: { refetchInterval: REFETCH_INTERVAL_MS },
  });
  return data?.unreadCount ?? 0;
}
