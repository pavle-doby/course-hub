"use client";

import { useState } from "react";
import { AlertCircleIcon } from "lucide-react";
import {
  getGetNotificationPreferencesQueryKey,
  useGetNotificationPreferences,
  useQueryClient,
  useSubscribeNotifications,
  useUnsubscribeNotifications,
  type SubscribeNotificationsBodyCategory,
} from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingAction, useErrorHandlingQuery } from "@repo/shared";
import { Alert, AlertTitle } from "@repo/ui-web/components/alert";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { toast } from "@repo/ui-web/components/sonner";
import { Switch } from "@repo/ui-web/components/switch";
import { useNotificationPermission } from "@/hooks/use-notification-permission";
import { notificationsService } from "@/services/notifications-service";

const CATEGORIES: SubscribeNotificationsBodyCategory[] = [
  "course_enrolled",
  "private_course_attempt",
  "course_updated",
  "creator_new_course",
];

export function NotificationPreferencesCard() {
  const { t } = useT();
  const queryClient = useQueryClient();
  const { status, request } = useNotificationPermission();
  const [isSaving, setIsSaving] = useState(false);

  const { data: preferences, isPending, error } = useGetNotificationPreferences();
  const showToastError = ({ title, description }: { title: string; description: string }) =>
    toast.error(title, { description });
  useErrorHandlingQuery({ t: t as (key: string) => string, error, showToastError });
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError,
  });

  const { mutateAsync: subscribeNotifications } = useSubscribeNotifications();
  const { mutateAsync: unsubscribeNotifications } = useUnsubscribeNotifications();

  const isBlocked = status === "denied" || status === "unsupported";
  const isLoading = isPending || !status;
  const isEnabled = (category: SubscribeNotificationsBodyCategory) =>
    !!preferences?.categories.includes(category);
  const allEnabled = CATEGORIES.every(isEnabled);

  async function handleToggle(categories: SubscribeNotificationsBodyCategory[], enabled: boolean) {
    setIsSaving(true);
    try {
      if (enabled) {
        if (status === "default") {
          await request();
        }
        await notificationsService.send({ categories, subscribeNotifications });
      } else {
        await Promise.all(
          categories.map((category) =>
            notificationsService.disable({ category, unsubscribeNotifications })
          )
        );
      }
      await queryClient.invalidateQueries({ queryKey: getGetNotificationPreferencesQueryKey() });
    } catch (error) {
      if (error instanceof Error && !("isAxiosError" in error)) {
        toast.error(error.message);
      } else {
        handleErrorAction(error as Error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="border-b">
        <CardTitle>{t("settings.notifications.title")}</CardTitle>
        <CardAction>
          {isLoading ? (
            <Skeleton className="h-5 w-24 rounded-full" />
          ) : (
            <label className="flex items-center gap-2 text-sm">
              {t("settings.notifications.allowAll")}
              <Switch
                checked={allEnabled}
                disabled={isSaving}
                onCheckedChange={(enabled) =>
                  handleToggle(
                    enabled ? CATEGORIES.filter((category) => !isEnabled(category)) : CATEGORIES,
                    enabled
                  )
                }
              />
            </label>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isBlocked && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>
              {status === "denied"
                ? t("notifications.status.blocked")
                : t("notifications.status.unsupported")}
            </AlertTitle>
          </Alert>
        )}
        <p className="text-sm text-muted-foreground">{t("settings.notifications.description")}</p>
        {CATEGORIES.map((category) => (
          <label key={category} className="flex items-start justify-between gap-3">
            <span className="flex flex-col gap-1">
              <span className="text-sm">
                {t(`settings.notifications.categories.${category}.title`)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t(`settings.notifications.categories.${category}.description`)}
              </span>
            </span>
            {isLoading ? (
              <Skeleton className="mt-0.5 h-5 w-8 rounded-full" />
            ) : (
              <Switch
                className="mt-0.5"
                checked={isEnabled(category)}
                disabled={isSaving}
                onCheckedChange={(enabled) => handleToggle([category], enabled)}
              />
            )}
          </label>
        ))}
      </CardContent>
    </Card>
  );
}
