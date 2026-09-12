"use client";

import type { CourseInvitation } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { Badge } from "@repo/ui-web/components/badge";
import { Mail, UserPlus } from "lucide-react";

type InvitationInfoProps = {
  invitation: CourseInvitation;
};

function statusVariant(status: CourseInvitation["status"]) {
  if (status === "accepted") {
    return "default" as const;
  }
  if (status === "revoked" || status === "expired") {
    return "destructive" as const;
  }
  return "secondary" as const;
}

function formatCreatedAt(createdAt: string, locale: string) {
  const date = new Date(createdAt);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString(locale, { month: "short" });
  return `${day}. ${month} ${date.getFullYear()}.`;
}

export function InviteCardInfo({ invitation }: InvitationInfoProps) {
  const { t, i18n } = useT();

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="flex items-center gap-2 truncate font-medium">
        {invitation.type === "email" ? (
          <Mail className="size-3.5" />
        ) : (
          <UserPlus className="size-3.5" />
        )}
        {invitation.type === "email" ? t("invite.dialog.type.email") : t("invite.dialog.type.link")}
        <Badge variant={statusVariant(invitation.status)} className="w-fit">
          {t(`invite.dialog.status.${invitation.status}`)}
        </Badge>
      </span>

      <span className="text-xs text-muted-foreground">
        {t("invite.dialog.createdAt", {
          date: formatCreatedAt(invitation.createdAt, i18n.language),
        })}
      </span>
    </div>
  );
}
