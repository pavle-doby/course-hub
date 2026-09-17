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
  EllipsisVertical,
  Pencil,
  Eye,
  Upload,
  Undo2,
  Archive,
  Trash2,
  UserPlus,
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
          <EllipsisVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="size-4" />
          {t("courses.card.edit")}
        </DropdownMenuItem>

        {isPrivate && (
          <DropdownMenuItem onClick={onInvite}>
            <UserPlus className="size-4" />
            {t("courses.card.invite")}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={onPreview}>
          <Eye className="size-4" />
          {t("courses.card.preview")}
        </DropdownMenuItem>

        {!isPublished && (
          <DropdownMenuItem onClick={onTogglePublish}>
            <Upload className="size-4" />
            {t("courses.card.publish")}
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {isPublished && (
          <DropdownMenuItem variant="destructive" onClick={onTogglePublish}>
            <Undo2 className="size-4" />
            {t("courses.card.unpublish")}
          </DropdownMenuItem>
        )}
        {!isArchived && (
          <DropdownMenuItem variant="destructive" onClick={onArchive}>
            <Archive className="size-4" />
            {t("courses.card.archive")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="size-4" />
          {t("courses.card.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
