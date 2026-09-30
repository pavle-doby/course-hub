import { useState } from "react";
import type { CourseProgress, LessonProgressStatus } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { Badge } from "@repo/ui-native/components/badge";
import { Skeleton } from "@repo/ui-native/components/skeleton";
import { Text } from "@repo/ui-native/components/text";
import type { Selection } from "@/modules/learn-course/hooks/use-course-tree";
import { useSaveLessonProgress } from "@/modules/learn-course/hooks/use-lesson-progress";
import { PROGRESS_STATUS_LABEL_KEYS } from "@/utils/consts";
import { LessonStatusSelect } from "./lesson-status-select";
import { ProgressStatusIcon } from "./progress-status-icon";

type LearnStatusProps = {
  publicId: string;
  selection: Selection;
  /** Present only when enrolled. */
  progress?: CourseProgress;
};

/**
 * Status of the selected item (web: next to the title in `LearnWorkingArea`): an editable dropdown
 * for a lesson, a read-only badge for a topic or the course (their status is derived).
 */
export function LearnStatus({ publicId, selection, progress }: LearnStatusProps) {
  const { t } = useTranslation();
  const saveLessonProgress = useSaveLessonProgress(publicId);
  const [isSaving, setIsSaving] = useState(false);

  function handleLessonStatusChange(lessonId: string, status: LessonProgressStatus) {
    setIsSaving(true);
    saveLessonProgress(lessonId, { status }, () => setIsSaving(false));
  }

  if (!progress) {
    return null;
  }

  if (selection.type === "lesson") {
    const status =
      progress.lessons.find((lesson) => lesson.lessonId === selection.id)?.status ?? "todo";

    return isSaving ? (
      <Skeleton className="h-9 w-full" />
    ) : (
      <LessonStatusSelect
        status={status}
        onStatusChange={(next) => handleLessonStatusChange(selection.id, next)}
      />
    );
  }

  const readOnlyStatus =
    selection.type === "course"
      ? progress.status
      : progress.topics.find((topic) => topic.topicId === selection.id)?.status;

  if (!readOnlyStatus) {
    return null;
  }

  return (
    <Badge variant="outline" className="h-9 w-full justify-start gap-2 px-3">
      <ProgressStatusIcon status={readOnlyStatus} />
      <Text className="text-sm">{t(PROGRESS_STATUS_LABEL_KEYS[readOnlyStatus])}</Text>
    </Badge>
  );
}
