"use client";

import { useState } from "react";
import {
  CourseWithStats,
  getGetCoursesQueryKey,
  useQueryClient,
  useUpdateCourse,
} from "@repo/api-client";
import { useRouter } from "next/navigation";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingAction } from "@repo/shared";
import { toast } from "@repo/ui-web/components/sonner";
import { useIsMobile } from "@repo/ui-web/hooks/use-mobile";
import { ChAlertDialog } from "@/components/ch-alert-dialog";
import { CourseCardDropdownActions } from "./course-card-dropdown-actions";
import { CourseCardDrawerActions } from "./course-card-drawer-actions";

type CourseCardActionsProps = {
  course: CourseWithStats;
  onDelete: (id: string) => void;
};

export function CourseCardActions({ course, onDelete }: CourseCardActionsProps) {
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
    <>
      {isMobile ? (
        <CourseCardDrawerActions {...actionMenuProps} />
      ) : (
        <CourseCardDropdownActions {...actionMenuProps} />
      )}

      <ChAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("courses.card.deleteDialog.title")}
        description={t("courses.card.deleteDialog.description", { name: course.name })}
        cancelLabel={t("courses.card.deleteDialog.cancel")}
        actionLabel={t("courses.card.deleteDialog.confirm")}
        actionProps={{ variant: "destructive", onClick: () => onDelete(course.id) }}
      />
    </>
  );
}
