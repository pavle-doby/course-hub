import { useState } from "react";
import { View } from "react-native";
import { useGetPublicQuiz, type CourseProgress } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { Button } from "@repo/ui-native/components/button";
import { Text } from "@repo/ui-native/components/text";
import { useSaveLessonProgress } from "@/modules/learn-course/hooks/use-lesson-progress";
import { useSelectionVideo } from "@/modules/learn-course/hooks/use-selection-video";
import { NEXT_LESSON_STATUS } from "@/utils/consts";

type LearnNextStepProps = {
  publicId: string;
  courseId: string;
  lessonId: string;
  progress: CourseProgress;
};

/**
 * Primary "Start lesson" / "Mark as done" button pinned above the bottom bar (web: the fixed
 * mobile button in `LearnWorkingArea`). The video and quiz queries share the content's cache.
 */
export function LearnNextStep({ publicId, courseId, lessonId, progress }: LearnNextStepProps) {
  const { t } = useTranslation();
  const saveLessonProgress = useSaveLessonProgress(publicId);
  const [isSaving, setIsSaving] = useState(false);
  const parent = { parentType: "lesson" as const, parentId: lessonId };
  const { isReady: isVideoReady } = useSelectionVideo(parent, courseId, true);
  const { data: quizData } = useGetPublicQuiz(parent);

  const status = progress.lessons.find((lesson) => lesson.lessonId === lessonId)?.status ?? "todo";
  const lessonNextStatus = NEXT_LESSON_STATUS[status];
  // A lesson with a video or quiz completes itself (video watched + all answers right), so it gets
  // no "Mark as done" button; the status dropdown can still change it.
  const nextStatus =
    lessonNextStatus?.status === "done" && (isVideoReady || quizData?.quiz)
      ? undefined
      : lessonNextStatus;

  if (!nextStatus) {
    return null;
  }

  function handlePress() {
    if (nextStatus) {
      setIsSaving(true);
      saveLessonProgress(lessonId, { status: nextStatus.status }, () => setIsSaving(false));
    }
  }

  return (
    <View className="bg-background px-4 pt-2">
      <Button disabled={isSaving} onPress={handlePress}>
        <Text>{t(nextStatus.labelKey)}</Text>
      </Button>
    </View>
  );
}
