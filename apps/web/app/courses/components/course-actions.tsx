"use client";

import { useState, type ComponentProps } from "react";
import {
  ArchiveIcon,
  BotIcon,
  GlobeIcon,
  LockIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  Trash2Icon,
  Undo2Icon,
  UploadIcon,
  UserPlusIcon,
} from "lucide-react";
import type { CourseStatus, CourseVisibility } from "@repo/api-client";
import { Button } from "@repo/ui-web/components/button";
import { Badge } from "@repo/ui-web/components/badge";
import { ButtonGroup } from "@repo/ui-web/components/button-group";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@repo/ui-web/components/drawer";
import { Separator } from "@repo/ui-web/components/separator";
import { Switch } from "@repo/ui-web/components/switch";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@repo/ui-web/components/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui-web/components/tooltip";
import { useT } from "@repo/i18n/client";
import { ChAlertDialog } from "@/components/ch-alert-dialog";

type CourseActionsProps = {
  status: CourseStatus;
  visibility?: CourseVisibility;
  onVisibilityChange?: (value: CourseVisibility) => void;
  onInviteClick?: () => void;
  aiAccessEnabled?: boolean;
  onAiAccessChange?: (value: boolean) => void;
  isPublished?: boolean;
  onPublishCourse?: () => void;
  onArchiveCourse?: () => void;
  onDeleteCourse?: () => void;
};

type CourseDialogKey =
  "visibilityPublic" | "visibilityPrivate" | "publish" | "unpublish" | "archive" | "delete";

type CourseDialogConfig = {
  key: CourseDialogKey;
  enabled: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  actionLabel: string;
  actionProps?: ComponentProps<typeof ChAlertDialog>["actionProps"];
};

function CollapsedAction({
  label,
  children,
  ...props
}: ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">{label}</TooltipContent>
    </Tooltip>
  );
}

export function CourseActions({
  status,
  visibility,
  onVisibilityChange,
  onInviteClick,
  aiAccessEnabled = false,
  onAiAccessChange,
  isPublished = false,
  onPublishCourse,
  onArchiveCourse,
  onDeleteCourse,
}: CourseActionsProps) {
  const { t } = useT();
  const { isMobile, openMobile, setOpenMobile, state, toggleSidebar } = useSidebar();
  const [activeDialog, setActiveDialog] = useState<CourseDialogKey | null>(null);
  const isPrivate = visibility === "private";
  const statusVariant =
    status === "published" ? "default" : status === "archived" ? "destructive" : "secondary";
  const hasStateActions = !!onPublishCourse || !!onArchiveCourse || !!onDeleteCourse;

  function handleAiAccessToggle() {
    onAiAccessChange?.(!aiAccessEnabled);
  }

  function openDialog(key: CourseDialogKey) {
    if (isMobile) {
      setOpenMobile(false);
    }
    setActiveDialog(key);
  }

  const dialogs: CourseDialogConfig[] = [
    {
      key: "visibilityPublic",
      enabled: !!onVisibilityChange,
      title: t("courses.editor.visibilityPublicDialog.title"),
      description: t("courses.editor.visibilityPublicDialog.description"),
      cancelLabel: t("courses.editor.cancel"),
      actionLabel: t("courses.editor.visibilityPublicDialog.confirm"),
      actionProps: { onClick: () => onVisibilityChange?.("public") },
    },
    {
      key: "visibilityPrivate",
      enabled: !!onVisibilityChange,
      title: t("courses.editor.visibilityPrivateDialog.title"),
      description: t("courses.editor.visibilityPrivateDialog.description"),
      cancelLabel: t("courses.editor.cancel"),
      actionLabel: t("courses.editor.visibilityPrivateDialog.confirm"),
      actionProps: { onClick: () => onVisibilityChange?.("private") },
    },
    {
      key: "publish",
      enabled: !!onPublishCourse,
      title: t("courses.editor.publishDialog.title"),
      description: t("courses.editor.publishDialog.description"),
      cancelLabel: t("courses.editor.cancel"),
      actionLabel: t("courses.editor.publishDialog.confirm"),
      actionProps: { onClick: onPublishCourse },
    },
    {
      key: "unpublish",
      enabled: !!onPublishCourse,
      title: t("courses.editor.unpublishDialog.title"),
      description: t("courses.editor.unpublishDialog.description"),
      cancelLabel: t("courses.editor.cancel"),
      actionLabel: t("courses.editor.unpublishDialog.confirm"),
      actionProps: { onClick: onPublishCourse },
    },
    {
      key: "archive",
      enabled: !!onArchiveCourse,
      title: t("courses.editor.archiveDialog.title"),
      description: t("courses.editor.archiveDialog.description"),
      cancelLabel: t("courses.editor.cancel"),
      actionLabel: t("courses.editor.archiveDialog.confirm"),
      actionProps: { variant: "destructive", onClick: onArchiveCourse },
    },
    {
      key: "delete",
      enabled: !!onDeleteCourse,
      title: t("courses.editor.deleteDialog.title"),
      description: t("courses.editor.deleteDialog.description"),
      cancelLabel: t("courses.editor.cancel"),
      actionLabel: t("courses.editor.deleteDialog.confirm"),
      actionProps: { variant: "destructive", onClick: onDeleteCourse },
    },
  ];

  const dialogsContent = dialogs.map(
    ({ key, enabled, title, description, cancelLabel, actionLabel, actionProps }) =>
      enabled && (
        <ChAlertDialog
          key={key}
          open={activeDialog === key}
          onOpenChange={(open) => {
            if (!open) {
              setActiveDialog(null);
            }
          }}
          title={title}
          description={description}
          cancelLabel={cancelLabel}
          actionLabel={actionLabel}
          actionProps={actionProps}
        />
      )
  );

  const visibilityActions = onVisibilityChange && (
    <>
      <ButtonGroup className="w-full">
        <Button
          type="button"
          variant={isPrivate ? "outline" : "default"}
          className="w-1/2 gap-1.5"
          onClick={() => openDialog("visibilityPublic")}
        >
          <GlobeIcon className="size-4" />
          {t("courses.editor.visibilityPublic")}
        </Button>
        <Button
          type="button"
          variant={isPrivate ? "default" : "outline"}
          className="w-1/2 gap-1.5"
          onClick={() => openDialog("visibilityPrivate")}
        >
          <LockIcon className="size-4" />
          {t("courses.editor.visibilityPrivate")}
        </Button>
      </ButtonGroup>
      {isPrivate && onInviteClick && (
        <Button type="button" variant="outline" className="w-full gap-1.5" onClick={onInviteClick}>
          <UserPlusIcon className="size-4" />
          {t("courses.editor.invite")}
        </Button>
      )}
    </>
  );

  const aiAccessAction = onAiAccessChange && (
    <label className="flex items-start justify-between gap-3">
      <span className="flex flex-col gap-1">
        <span className="text-sm">{t("courses.editor.aiAccessLabel")}</span>
        <span className="text-xs text-muted-foreground">
          {t("courses.editor.aiAccessDescription")}
        </span>
      </span>
      <Switch className="mt-0.5" checked={aiAccessEnabled} onCheckedChange={onAiAccessChange} />
    </label>
  );

  const deleteAction = onDeleteCourse && (
    <Button
      variant="destructive"
      className="w-full justify-start gap-2"
      onClick={() => openDialog("delete")}
    >
      <Trash2Icon className="size-4" />
      {t("courses.editor.delete")}
    </Button>
  );

  function renderStateActions(includeDelete = true) {
    return (
      <>
        {onPublishCourse && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => openDialog(isPublished ? "unpublish" : "publish")}
          >
            {isPublished ? <Undo2Icon className="size-4" /> : <UploadIcon className="size-4" />}
            {isPublished ? t("courses.editor.unpublish") : t("courses.editor.publish")}
          </Button>
        )}
        {onArchiveCourse && (
          <Button
            variant="destructive"
            className="w-full justify-start gap-2"
            onClick={() => openDialog("archive")}
          >
            <ArchiveIcon className="size-4" />
            {t("courses.editor.archive")}
          </Button>
        )}
        {includeDelete && onArchiveCourse && onDeleteCourse && (
          <Separator className="-mx-4 !w-auto" />
        )}
        {includeDelete && deleteAction}
      </>
    );
  }

  const collapsedActions = (
    <SidebarContent className="hidden items-center gap-1 p-2 group-data-[collapsible=icon]:flex">
      {onVisibilityChange && (
        <>
          <CollapsedAction
            label={t("courses.editor.visibilityPublic")}
            variant={isPrivate ? "ghost" : "secondary"}
            onClick={() => openDialog("visibilityPublic")}
          >
            <GlobeIcon className="size-4" />
          </CollapsedAction>
          <CollapsedAction
            label={t("courses.editor.visibilityPrivate")}
            variant={isPrivate ? "secondary" : "ghost"}
            onClick={() => openDialog("visibilityPrivate")}
          >
            <LockIcon className="size-4" />
          </CollapsedAction>
          {isPrivate && onInviteClick && (
            <CollapsedAction label={t("courses.editor.invite")} onClick={onInviteClick}>
              <UserPlusIcon className="size-4" />
            </CollapsedAction>
          )}
        </>
      )}
      {onAiAccessChange && (
        <CollapsedAction
          label={t("courses.editor.aiAccessLabel")}
          variant={aiAccessEnabled ? "secondary" : "ghost"}
          aria-pressed={aiAccessEnabled}
          onClick={handleAiAccessToggle}
        >
          <BotIcon className="size-4" />
        </CollapsedAction>
      )}
      {onVisibilityChange && hasStateActions && <Separator />}
      {onPublishCourse && (
        <CollapsedAction
          label={isPublished ? t("courses.editor.unpublish") : t("courses.editor.publish")}
          onClick={() => openDialog(isPublished ? "unpublish" : "publish")}
        >
          {isPublished ? <Undo2Icon className="size-4" /> : <UploadIcon className="size-4" />}
        </CollapsedAction>
      )}
      {onArchiveCourse && (
        <CollapsedAction label={t("courses.editor.archive")} onClick={() => openDialog("archive")}>
          <ArchiveIcon className="size-4" />
        </CollapsedAction>
      )}
      {onArchiveCourse && onDeleteCourse && <Separator />}
      {onDeleteCourse && (
        <CollapsedAction label={t("courses.editor.delete")} onClick={() => openDialog("delete")}>
          <Trash2Icon className="size-4" />
        </CollapsedAction>
      )}
    </SidebarContent>
  );

  if (isMobile) {
    return (
      <>
        <Drawer open={openMobile} onOpenChange={setOpenMobile}>
          <DrawerContent>
            <DrawerHeader className="border-b text-left">
              <div className="flex flex-1 items-center justify-between">
                <DrawerTitle>{t("courses.editor.actions")}</DrawerTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("courses.editor.status")}
                  </span>
                  <Badge variant={statusVariant} className="ml-auto">
                    {t(`courses.status.${status}`)}
                  </Badge>
                </div>
              </div>
            </DrawerHeader>
            <div className="flex max-h-[calc(80vh-7rem)] flex-col gap-5 overflow-y-auto p-4 pb-16">
              {onVisibilityChange && (
                <section className="flex flex-col gap-3">
                  <h2 className="text-sm font-medium">{t("courses.editor.visibility")}</h2>
                  {visibilityActions}
                </section>
              )}
              {onAiAccessChange && (
                <>
                  <Separator className="-mx-4 !w-auto" />
                  <section className="flex flex-col gap-3">
                    <h2 className="text-sm font-medium">{t("courses.editor.aiAccess")}</h2>
                    {aiAccessAction}
                  </section>
                </>
              )}
              {onVisibilityChange && hasStateActions && <Separator className="-mx-4 !w-auto" />}
              {hasStateActions && (
                <section className="flex flex-col gap-3">
                  <h2 className="text-sm font-medium">{t("courses.editor.state")}</h2>
                  {renderStateActions()}
                </section>
              )}
            </div>
          </DrawerContent>
        </Drawer>
        {dialogsContent}
      </>
    );
  }

  return (
    <Sidebar side="right" collapsible="icon" className="border-l">
      <SidebarHeader className="sticky top-0 z-10 flex h-14 shrink-0 flex-row items-center justify-between border-b bg-sidebar p-2">
        <Button
          variant="ghost"
          size="icon"
          className="flex"
          onClick={toggleSidebar}
          aria-label={t("courses.editor.collapseActions")}
        >
          {state === "collapsed" ? (
            <PanelRightOpenIcon className="size-4" />
          ) : (
            <PanelRightCloseIcon className="size-4" />
          )}
        </Button>
        <span className="px-2 font-medium group-data-[collapsible=icon]:hidden">
          {t("courses.editor.actions")}
        </span>
      </SidebarHeader>

      <SidebarContent className="flex flex-col gap-3 p-2 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-medium text-sidebar-foreground/70">
            {t("courses.editor.status")}
          </span>
          <Badge variant={statusVariant} className="ml-auto">
            {t(`courses.status.${status}`)}
          </Badge>
        </div>
        {(onVisibilityChange || onPublishCourse || onArchiveCourse) && (
          <Separator className="-mx-2 !w-auto" />
        )}
        {onVisibilityChange && (
          <SidebarGroup className="gap-3">
            <h2 className="text-sm font-medium text-sidebar-foreground/70">
              {t("courses.editor.visibility")}
            </h2>
            {visibilityActions}
            <Separator className="-mx-4 !w-auto" />
          </SidebarGroup>
        )}

        {onAiAccessChange && (
          <SidebarGroup className="gap-3">
            <h2 className="text-sm font-medium text-sidebar-foreground/70">
              {t("courses.editor.aiAccess")}
            </h2>
            {aiAccessAction}
            <Separator className="-mx-4 !w-auto" />
          </SidebarGroup>
        )}

        {(onPublishCourse || onArchiveCourse) && (
          <SidebarGroup className="gap-3">
            <h2 className="text-sm font-medium text-sidebar-foreground/70">
              {t("courses.editor.state")}
            </h2>
            {renderStateActions(false)}
            <Separator className="-mx-4 !w-auto" />
          </SidebarGroup>
        )}
      </SidebarContent>

      {collapsedActions}

      {onDeleteCourse && (
        <SidebarFooter className="border-t p-2 group-data-[collapsible=icon]:hidden">
          {deleteAction}
        </SidebarFooter>
      )}

      <SidebarRail />

      {dialogsContent}
    </Sidebar>
  );
}
