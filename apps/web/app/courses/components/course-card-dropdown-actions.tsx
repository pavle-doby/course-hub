"use client";

import { Course } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@repo/ui-web/components/dropdown-menu";
import { Button } from "@repo/ui-web/components/button";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  EyeIcon,
  UploadIcon,
  Undo2Icon,
  ArchiveIcon,
  Trash2Icon,
  UserPlusIcon,
} from "lucide-react";

type CourseCardDropdownActionsProps = {
  course: Course;
  onEdit: () => void;
  onInvite: () => void;
  onPreview: () => void;
  onTogglePublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

export function CourseCardDropdownActions({
  course,
  onEdit,
  onInvite,
  onPreview,
  onTogglePublish,
  onArchive,
  onDelete,
}: CourseCardDropdownActionsProps) {
  const { t } = useT();

  const isPublished = course.status === "published";
  const isArchived = course.status === "archived";
  const isPrivate = course.visibility === "private";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7">
          <EllipsisVerticalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <PencilIcon className="size-4" />
          {t("courses.card.edit")}
        </DropdownMenuItem>

        {isPrivate && (
          <DropdownMenuItem onClick={onInvite}>
            <UserPlusIcon className="size-4" />
            {t("courses.card.invite")}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={onPreview}>
          <EyeIcon className="size-4" />
          {t("courses.card.preview")}
        </DropdownMenuItem>

        {!isPublished && (
          <DropdownMenuItem onClick={onTogglePublish}>
            <UploadIcon className="size-4" />
            {t("courses.card.publish")}
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {isPublished && (
          <DropdownMenuItem variant="destructive" onClick={onTogglePublish}>
            <Undo2Icon className="size-4" />
            {t("courses.card.unpublish")}
          </DropdownMenuItem>
        )}
        {!isArchived && (
          <DropdownMenuItem variant="destructive" onClick={onArchive}>
            <ArchiveIcon className="size-4" />
            {t("courses.card.archive")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2Icon className="size-4" />
          {t("courses.card.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
