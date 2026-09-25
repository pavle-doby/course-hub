import Link from "next/link";
import type { NotificationItem } from "@repo/api-client";
import { Badge } from "@repo/ui-web/components/badge";
import { Card } from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { useT } from "@repo/i18n/client";
import { cn } from "@repo/ui-web/lib/utils";

export function NotificationCard({ notification }: { notification: NotificationItem }) {
  const { t } = useT();
  const isUnread = !notification.readAt;

  return (
    <Link href={notification.url}>
      <Card
        className={cn(
          "gap-1 px-4 transition-colors hover:bg-accent",
          isUnread && "border-primary bg-primary/5 hover:bg-primary/10"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">{notification.title}</span>
          {isUnread && <Badge>{t("notifications.history.new")}</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{notification.body}</p>
        <span className="text-xs text-muted-foreground">
          {new Date(notification.createdAt).toLocaleString()}
        </span>
      </Card>
    </Link>
  );
}

export function NotificationCardSkeleton() {
  return (
    <Card className="gap-2 px-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-24" />
    </Card>
  );
}
