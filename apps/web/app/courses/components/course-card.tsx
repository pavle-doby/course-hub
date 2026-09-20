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
import { Badge } from "@repo/ui-web/components/badge";
import { BookOpen, Folder } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingAction } from "@repo/shared";
import { toast } from "@repo/ui-web/components/sonner";
import { useIsMobile } from "@repo/ui-web/hooks/use-mobile";
import { ChAlertDialog } from "@/components/ch-alert-dialog";
import { courseCardGradient } from "@/utils/course-card-gradient";
import { CourseCardDropdownActions } from "./course-card-dropdown-actions";
import { CourseCardDrawerActions } from "./course-card-drawer-actions";

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
  const isMobile = useIsMobile();
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });

  const { mutateAsync: updateCourse } = useUpdateCourse();

  const isPublished = course.status === "published";

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

  const actionMenuProps = {
    course,
    onEdit: () => router.push(`/courses/${course.publicId}/edit`),
    onInvite: () => router.push(`/courses/${course.publicId}/edit?tab=invite`),
    onPreview: () => router.push(`/learn/${course.publicId}`),
    onTogglePublish: handleTogglePublish,
    onArchive: handleArchive,
    onDelete: () => setDeleteDialogOpen(true),
  };

  return (
    <Card className="gap-0 py-0">
      {course.thumbnailUrl ? (
        <Image
          src={course.thumbnailUrl}
          alt=""
          width={640}
          height={178}
          unoptimized
          className="h-[178px] w-full object-cover"
        />
      ) : (
        <div
          className={`flex h-[178px] w-full items-center justify-center bg-gradient-to-br ${courseCardGradient(course.id)}`}
        >
          <BookOpen className="size-10 text-white/90" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2 pt-2 text-primary">
          <Folder className="size-4 shrink-0" />
          <CardTitle>{course.name}</CardTitle>
        </div>
        <CardAction>
          {isMobile ? (
            <CourseCardDrawerActions {...actionMenuProps} />
          ) : (
            <CourseCardDropdownActions {...actionMenuProps} />
          )}
        </CardAction>
      </CardHeader>

      <CardContent className="line-clamp-3 flex-1">{course.description}</CardContent>

      <CardFooter className="gap-2">
        <Badge variant={statusVariant[course.status]}>{t(`courses.status.${course.status}`)}</Badge>
        <Badge variant={course.visibility === "public" ? "outline" : "default"}>
          {course.visibility === "public"
            ? t("courses.editor.visibilityPublic")
            : t("courses.editor.visibilityPrivate")}
        </Badge>
      </CardFooter>

      <ChAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("courses.card.deleteDialog.title")}
        description={t("courses.card.deleteDialog.description", { name: course.name })}
        cancelLabel={t("courses.card.deleteDialog.cancel")}
        actionLabel={t("courses.card.deleteDialog.confirm")}
        actionProps={{ variant: "destructive", onClick: () => onDelete(course.id) }}
      />
    </Card>
  );
}
