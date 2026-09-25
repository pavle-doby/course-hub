"use client";

import { useEffect } from "react";
import {
  getGetNotificationsQueryKey,
  useGetNotifications,
  useMarkNotificationsRead,
  useQueryClient,
} from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingQuery } from "@repo/shared";
import { Badge } from "@repo/ui-web/components/badge";
import { toast } from "@repo/ui-web/components/sonner";
import { usePagination } from "@/hooks/use-pagination";
import { UNREAD_NOTIFICATIONS_PARAMS } from "@/hooks/use-unread-notifications";
import { PageHeader } from "@/components/page-header";
import { ChPagination, ChPaginationSkeleton } from "@/components/ch-pagination";
import { NotificationsStatusCard } from "@/app/notifications/components/notifications-status-card";
import {
  NotificationCard,
  NotificationCardSkeleton,
} from "@/app/notifications/components/notification-card";

const PAGE_LIMIT = 10;
const SKELETON_ROWS = 5;

export default function NotificationsPage() {
  const { t } = useT();
  const queryClient = useQueryClient();
  const { page, setPage, trackTotalPages } = usePagination();

  const {
    data: notifications,
    isPending,
    error,
  } = useGetNotifications({ page, limit: PAGE_LIMIT });
  useErrorHandlingQuery({
    t: t as (key: string) => string,
    error,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });

  const { mutate: markRead } = useMarkNotificationsRead();
  const unreadCount = notifications?.unreadCount ?? 0;

  // Mark everything read on open. Only the bell count is refreshed, so unread items stay
  // highlighted in the list for this visit.
  useEffect(() => {
    if (unreadCount > 0) {
      markRead(undefined, {
        onSuccess: () =>
          queryClient.invalidateQueries({
            queryKey: getGetNotificationsQueryKey(UNREAD_NOTIFICATIONS_PARAMS),
          }),
      });
    }
  }, [unreadCount, markRead, queryClient]);

  const { totalPages, knownTotalPages } = trackTotalPages(notifications?.pagination);

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        className="mb-6"
        titleClassName="hidden md:block"
        title={t("notifications.history.title")}
        action={
          unreadCount > 0 && (
            <Badge aria-label={t("notifications.history.unreadCount", { count: unreadCount })}>
              {unreadCount}
            </Badge>
          )
        }
      />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col p-4 pt-0 md:px-6 md:pb-6">
        {isPending ? (
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex flex-col gap-3">
              {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <NotificationCardSkeleton key={i} />
              ))}
            </div>
            <ChPaginationSkeleton className="mt-6" page={page} totalPages={knownTotalPages} />
          </div>
        ) : notifications?.data.length ? (
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex flex-col gap-3">
              {notifications.data.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
            <ChPagination
              className="mt-6"
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              previousLabel={t("notifications.history.pagination.previous")}
              nextLabel={t("notifications.history.pagination.next")}
            />
          </div>
        ) : (
          <NotificationsStatusCard />
        )}
      </div>
    </div>
  );
}
