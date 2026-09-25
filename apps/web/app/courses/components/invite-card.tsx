"use client";

import type { CourseInvitation, CourseInvitationAcceptedByUser } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { AlertDialogTrigger } from "@repo/ui-web/components/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui-web/components/avatar";
import { Button } from "@repo/ui-web/components/button";
import { Separator } from "@repo/ui-web/components/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui-web/components/tooltip";
import { CopyIcon, Undo2Icon } from "lucide-react";
import { ChAlertDialog } from "@/components/ch-alert-dialog";
import { InviteCardInfo } from "./invite-card-info";

type InviteCardProps = {
  invitation: CourseInvitation;
  onCopy: (token: string) => void;
  onRevoke: (invitationId: string) => void;
};

type InviteUser = NonNullable<CourseInvitationAcceptedByUser>;

function userInitials(user: InviteUser) {
  const initials = `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`;
  return initials || user.username.charAt(0).toUpperCase();
}

function userName(user: InviteUser) {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return fullName || user.username;
}

function UserSummary({ invitation }: { invitation: CourseInvitation }) {
  const user =
    invitation.status === "accepted"
      ? invitation.acceptedByUser
      : invitation.status === "pending" && invitation.type === "email"
        ? invitation.invitedUser
        : undefined;
  const email =
    invitation.status === "pending" && invitation.type === "email" ? invitation.email : null;

  if (!user && !email) {
    return null;
  }

  return (
    <>
      <Separator orientation="vertical" className="hidden self-stretch sm:block" />
      {user ? (
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
      ) : (
        <span className="min-w-0 self-center truncate text-xs">{email}</span>
      )}
    </>
  );
}

export function InviteCard({ invitation, onCopy, onRevoke }: InviteCardProps) {
  const { t } = useT();

  return (
    <div className="flex items-start gap-2 rounded-md border p-2 text-sm">
      <div className="flex flex-row flex-wrap gap-2">
        <InviteCardInfo invitation={invitation} />
        <UserSummary invitation={invitation} />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onCopy(invitation.token)}
              aria-label={t("invite.dialog.copyLinkTooltip")}
            >
              <CopyIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("invite.dialog.copyLinkTooltip")}</TooltipContent>
        </Tooltip>

        {invitation.status === "pending" && (
          <ChAlertDialog
            title={t("invite.dialog.revokeConfirmTitle")}
            description={t("invite.dialog.revokeConfirmDescription")}
            cancelLabel={t("invite.dialog.revokeConfirmCancel")}
            actionLabel={t("invite.dialog.revokeConfirmAction")}
            actionProps={{ variant: "destructive", onClick: () => onRevoke(invitation.id) }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={t("invite.dialog.revoke")}>
                    <Undo2Icon className="size-4" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>{t("invite.dialog.revoke")}</TooltipContent>
            </Tooltip>
          </ChAlertDialog>
        )}
      </div>
    </div>
  );
}
