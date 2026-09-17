"use client";

import { useState } from "react";
import { Course } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui-web/components/drawer";
import { Button } from "@repo/ui-web/components/button";
import { Separator } from "@repo/ui-web/components/separator";
import {
  EllipsisVertical,
  Pencil,
  Eye,
  Upload,
  Undo2,
  Archive,
  Trash2,
  UserPlus,
} from "lucide-react";

type CourseCardDrawerActionsProps = {
  course: Course;
  onEdit: () => void;
  onInvite: () => void;
  onPreview: () => void;
  onTogglePublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

export function CourseCardDrawerActions({
  course,
  onEdit,
  onInvite,
  onPreview,
  onTogglePublish,
  onArchive,
  onDelete,
}: CourseCardDrawerActionsProps) {
  const { t } = useT();
  const [actionsOpen, setActionsOpen] = useState(false);

  const isPublished = course.status === "published";
  const isArchived = course.status === "archived";
  const isPrivate = course.visibility === "private";

  return (
    <Drawer open={actionsOpen} onOpenChange={setActionsOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7">
          <EllipsisVertical className="size-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="border-b text-left">
          <DrawerTitle>{t("courses.card.actions")}</DrawerTitle>
        </DrawerHeader>
        <div className="flex max-h-[calc(80vh-3.5rem)] flex-col gap-3 overflow-y-auto p-2 pb-8">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={onEdit}>
              <Pencil className="size-4" />
              {t("courses.card.edit")}
            </Button>
          </DrawerClose>

          {isPrivate && (
            <DrawerClose asChild>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={onInvite}>
                <UserPlus className="size-4" />
                {t("courses.card.invite")}
              </Button>
            </DrawerClose>
          )}

          <DrawerClose asChild>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={onPreview}>
              <Eye className="size-4" />
              {t("courses.card.preview")}
            </Button>
          </DrawerClose>

          {!isPublished && (
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={onTogglePublish}
              >
                <Upload className="size-4" />
                {t("courses.card.publish")}
              </Button>
            </DrawerClose>
          )}

          <Separator className="-mx-4 !w-auto" />

          {isPublished && (
            <DrawerClose asChild>
              <Button
                variant="destructive"
                className="w-full justify-start gap-2"
                onClick={onTogglePublish}
              >
                <Undo2 className="size-4" />
                {t("courses.card.unpublish")}
              </Button>
            </DrawerClose>
          )}
          {!isArchived && (
            <DrawerClose asChild>
              <Button
                variant="destructive"
                className="w-full justify-start gap-2"
                onClick={onArchive}
              >
                <Archive className="size-4" />
                {t("courses.card.archive")}
              </Button>
            </DrawerClose>
          )}
          <DrawerClose asChild>
            <Button variant="destructive" className="w-full justify-start gap-2" onClick={onDelete}>
              <Trash2 className="size-4" />
              {t("courses.card.delete")}
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
