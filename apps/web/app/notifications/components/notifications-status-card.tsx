"use client";

import { BellIcon, BellOffIcon, BellRingIcon } from "lucide-react";
import { useT } from "@repo/i18n/client";
import { Button } from "@repo/ui-web/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { useNotificationPermission } from "@/hooks/use-notification-permission";

// Device-level status: browser permission. Per-course opt-ins are still asked on each course.
export function NotificationsStatusCard() {
  const { t } = useT();
  const { status, request } = useNotificationPermission();

  const Icon = status === "granted" ? BellRingIcon : status === "default" ? BellIcon : BellOffIcon;
  const description = {
    granted: t("notifications.status.enabledHistory"),
    default: t("notifications.status.disabled"),
    denied: t("notifications.status.blocked"),
    unsupported: t("notifications.status.unsupported"),
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4" />
          {t("notifications.history.empty")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-4">
        {status ? (
          <CardDescription>{description[status]}</CardDescription>
        ) : (
          <Skeleton className="h-4 w-3/4" />
        )}
        {status === "default" && <Button onClick={request}>{t("notifications.enable")}</Button>}
      </CardContent>
    </Card>
  );
}
