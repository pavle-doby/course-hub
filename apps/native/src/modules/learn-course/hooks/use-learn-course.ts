import {
  useGetCourseProgress,
  useGetEnrolledCourseLessons,
  useGetEnrolledCourseTopics,
  useGetEnrollmentStatus,
  useGetMyCourseReview,
  useGetPublicCourseByPublicId,
  useGetPublicCourseLessons,
  useGetPublicCourseTopics,
  type LessonProgressStatus,
} from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { useErrorHandlingQuery } from "@repo/shared";
import { useCourseTree } from "@/modules/learn-course/hooks/use-course-tree";
import { showToastError } from "@/utils/toast-error";

/**
 * Reader data (web: top of `learn/[publicId]/page.tsx`): the course, enrollment, the tree (public
 * outline when not enrolled, full content when enrolled), the learner's progress and review.
 */
export function useLearnCourse(publicId: string) {
  const { t } = useTranslation();
  const tKey = t as (key: string) => string;

  const {
    data: course,
    isPending: isCoursePending,
    error: courseError,
  } = useGetPublicCourseByPublicId({ publicId });

  const {
    data: enrollmentStatus,
    isPending: isLoadingEnrollment,
    refetch: refetchEnrollmentStatus,
  } = useGetEnrollmentStatus({ publicId }, { query: { retry: false } });
  const isEnrolled = !!enrollmentStatus?.enrolled;

  const { data: publicTopics, error: publicTopicsError } = useGetPublicCourseTopics(
    { publicId },
    { query: { enabled: !isEnrolled } }
  );
  const { data: publicLessons, error: publicLessonsError } = useGetPublicCourseLessons(
    { publicId },
    { query: { enabled: !isEnrolled } }
  );
  const {
    data: fullTopics,
    isLoading: isFullTopicsLoading,
    error: fullTopicsError,
  } = useGetEnrolledCourseTopics({ publicId }, { query: { enabled: isEnrolled } });
  const {
    data: fullLessons,
    isLoading: isFullLessonsLoading,
    error: fullLessonsError,
  } = useGetEnrolledCourseLessons({ publicId }, { query: { enabled: isEnrolled } });

  const { handleErrorAction } = useErrorHandlingQuery({
    t: tKey,
    error: courseError,
    showToastError,
  });
  useErrorHandlingQuery({ t: tKey, error: publicTopicsError, showToastError });
  useErrorHandlingQuery({ t: tKey, error: publicLessonsError, showToastError });
  useErrorHandlingQuery({ t: tKey, error: fullTopicsError, showToastError });
  useErrorHandlingQuery({ t: tKey, error: fullLessonsError, showToastError });

  const topics = isEnrolled
    ? fullTopics
    : publicTopics?.map((topic) => ({ ...topic, description: null }));
  const lessons = isEnrolled
    ? fullLessons
    : publicLessons?.map((lesson) => ({ ...lesson, description: null }));
  const isLoadingTree = isEnrolled && (isFullTopicsLoading || isFullLessonsLoading);

  const { data: progress, isLoading: isProgressLoading } = useGetCourseProgress(
    { publicId },
    { query: { enabled: isEnrolled } }
  );
  const { data: myReview } = useGetMyCourseReview({ publicId }, { query: { enabled: isEnrolled } });

  const statusById = new Map<string, LessonProgressStatus>(
    isEnrolled
      ? [
          ...(progress?.topics ?? []).map((topic) => [topic.topicId, topic.status] as const),
          ...(progress?.lessons ?? []).map((lesson) => [lesson.lessonId, lesson.status] as const),
        ]
      : []
  );

  const tree = useCourseTree(topics, lessons);
  const flatLessons = tree.flatMap((topic) => topic.lessons);
  const doneLessonCount = (progress?.lessons ?? []).filter(
    (lesson) => lesson.status === "done"
  ).length;
  const progressPercent =
    isEnrolled && progress && flatLessons.length > 0
      ? Math.round((doneLessonCount / flatLessons.length) * 100)
      : undefined;

  return {
    course,
    isCoursePending,
    isEnrolled,
    isLoadingEnrollment,
    refetchEnrollmentStatus,
    tree,
    flatLessons,
    isLoadingTree,
    progress: isEnrolled ? progress : undefined,
    isProgressLoading: isEnrolled && isProgressLoading,
    statusById,
    progressPercent,
    /** Loaded (enrolled only) and the learner hasn't reviewed the course yet. */
    hasNoReview: isEnrolled && !!myReview && !myReview.review,
    handleErrorAction,
  };
}
