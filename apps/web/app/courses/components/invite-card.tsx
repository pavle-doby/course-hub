"use client";

import type { CourseInvitation, CourseInvitationAcceptedByUser } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui-web/components/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui-web/components/avatar";
import { Badge } from "@repo/ui-web/components/badge";
import { Button } from "@repo/ui-web/components/button";
import { Separator } from "@repo/ui-web/components/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui-web/components/tooltip";
import { Copy, Mail, Undo2, UserPlus } from "lucide-react";
import type { ReactNode } from "react";

type InviteCardProps = {
  invitation: CourseInvitation;
  onCopy: (token: string) => void;
  onRevoke: (invitationId: string) => void;
};

type InviteUser = NonNullable<CourseInvitationAcceptedByUser>;

function statusVariant(status: CourseInvitation["status"]) {
  if (status === "accepted") return "default" as const;
  if (status === "revoked" || status === "expired") return "destructive" as const;
  return "secondary" as const;
}

function userInitials(user: InviteUser) {
  const initials = `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`;
  return initials || user.username.charAt(0).toUpperCase();
}

function userName(user: InviteUser) {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return fullName || user.username;
}

function formatCreatedAt(createdAt: string, locale: string) {
  const date = new Date(createdAt);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString(locale, { month: "short" });
  return `${day}. ${month} ${date.getFullYear()}.`;
}

function UserSummary({ user }: { user: InviteUser }) {
  return (
    <div className="flex shrink-0 items-center gap-2 self-center">
      <Avatar size="sm">
        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.username} />}
        <AvatarFallback>{userInitials(user)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-xs font-medium">{userName(user)}</span>
        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
      </div>
    </div>
  );
}

export function InviteCard({ invitation, onCopy, onRevoke }: InviteCardProps) {
  const { t, i18n } = useT();

  let invitedInfo: ReactNode = null;
  if (invitation.status === "accepted" && invitation.acceptedByUser) {
    invitedInfo = <UserSummary user={invitation.acceptedByUser} />;
  } else if (invitation.status === "pending" && invitation.type === "email") {
    invitedInfo = invitation.invitedUser ? (
      <UserSummary user={invitation.invitedUser} />
    ) : (
      <span className="min-w-0 self-center truncate text-xs">{invitation.email}</span>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-md border p-2 text-sm">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="flex items-center gap-2 truncate font-medium">
          {invitation.type === "email" ? (
            <Mail className="size-3.5" />
          ) : (
            <UserPlus className="size-3.5" />
          )}
          {invitation.type === "email"
            ? t("invite.dialog.type.email")
            : t("invite.dialog.type.link")}
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

      {invitedInfo && (
        <>
          <Separator orientation="vertical" className="self-stretch" />
          {invitedInfo}
        </>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onCopy(invitation.token)}
              aria-label={t("invite.dialog.copyLinkTooltip")}
            >
              <Copy className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("invite.dialog.copyLinkTooltip")}</TooltipContent>
        </Tooltip>

        {invitation.status === "pending" && (
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={t("invite.dialog.revoke")}>
                    <Undo2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>{t("invite.dialog.revoke")}</TooltipContent>
            </Tooltip>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("invite.dialog.revokeConfirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("invite.dialog.revokeConfirmDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("invite.dialog.revokeConfirmCancel")}</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => onRevoke(invitation.id)}>
                  {t("invite.dialog.revokeConfirmAction")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
