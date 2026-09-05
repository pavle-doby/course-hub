"use client";

import { useState } from "react";
import { Course, getGetCoursesQueryKey, useQueryClient, useUpdateCourse } from "@repo/api-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter,
} from "@repo/ui-web/components/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@repo/ui-web/components/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@repo/ui-web/components/alert-dialog";
import { Button } from "@repo/ui-web/components/button";
import { Badge } from "@repo/ui-web/components/badge";
import {
  Folder,
  EllipsisVertical,
  Pencil,
  Eye,
  Trash2,
  Upload,
  Undo2,
  Archive,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingAction } from "@repo/shared";
import { toast } from "@repo/ui-web/components/sonner";

type CourseCardProps = {
  course: Course;
  onDelete: (id: string) => void;
};

const statusVariant = {
  draft: "secondary",
  published: "default",
  archived: "outline",
} as const;

export function CourseCard({ course, onDelete }: CourseCardProps) {
  const router = useRouter();
  const { t } = useT();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });

  const { mutateAsync: updateCourse } = useUpdateCourse();

  const isPublished = course.status === "published";
  const isArchived = course.status === "archived";

  async function handleTogglePublish() {
    try {
      const nextStatus = isPublished ? "draft" : "published";
      await updateCourse({
        pathParams: { id: course.id },
        data:
          nextStatus === "published"
            ? { status: nextStatus, publishedAt: new Date().toISOString() }
            : { status: nextStatus },
      });
      await queryClient.invalidateQueries({ queryKey: getGetCoursesQueryKey() });
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleArchive() {
    try {
      await updateCourse({ pathParams: { id: course.id }, data: { status: "archived" } });
      await queryClient.invalidateQueries({ queryKey: getGetCoursesQueryKey() });
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-primary">
          <Folder className="size-4 shrink-0" />
          <CardTitle>{course.name}</CardTitle>
        </div>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/courses/${course.publicId}/edit`)}>
                <Pencil className="size-4" />
                {t("courses.card.edit")}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push(`/courses/${course.publicId}`)}>
                <Eye className="size-4" />
                {t("courses.card.preview")}
              </DropdownMenuItem>

              {!isPublished && (
                <DropdownMenuItem onClick={handleTogglePublish}>
                  <Upload className="size-4" />
                  {t("courses.card.publish")}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {isPublished && (
                <DropdownMenuItem variant="destructive" onClick={handleTogglePublish}>
                  {<Undo2 className="size-4" />}
                  {t("courses.card.unpublish")}
                </DropdownMenuItem>
              )}
              {!isArchived && (
                <DropdownMenuItem variant="destructive" onClick={handleArchive}>
                  <Archive className="size-4" />
                  {t("courses.card.archive")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="size-4" />
                {t("courses.card.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>

      <CardContent className="line-clamp-3 flex-1">{course.description}</CardContent>

      <CardFooter>
        <Badge variant={statusVariant[course.status]}>{t(`courses.status.${course.status}`)}</Badge>
      </CardFooter>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("courses.card.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("courses.card.deleteDialog.description", { name: course.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("courses.card.deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => onDelete(course.id)}>
              {t("courses.card.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
