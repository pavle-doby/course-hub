import { useEffect, useEffectEvent, useState } from "react";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  getGetCoursesQueryKey,
  getGetEnrolledCoursesQueryKey,
  useEnrollInCourse,
  useQueryClient,
  useWithdrawFromCourse,
} from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { Text } from "@repo/ui-native/components/text";
import { KeyboardAwareScrollView } from "@/components/keyboard-aware-scroll-view";
import { CourseCompletedDialog } from "@/modules/learn-course/components/course-completed-dialog";
import { LearnBottomBar } from "@/modules/learn-course/components/learn-bottom-bar";
import { LearnContent } from "@/modules/learn-course/components/learn-content";
import { LearnContentSkeleton } from "@/modules/learn-course/components/learn-content-skeleton";
import { LearnHeader } from "@/modules/learn-course/components/learn-header";
import { LearnNextStep } from "@/modules/learn-course/components/learn-next-step";
import { LearnReaderSkeleton } from "@/modules/learn-course/components/learn-reader-skeleton";
import { LearnTreeSheet } from "@/modules/learn-course/components/learn-tree-sheet";
import { ReviewDialog } from "@/modules/reviews/components/review-dialog";
import { useCelebrate } from "@/modules/learn-course/hooks/use-celebrate";
import { useAdjacentSelection, type Selection } from "@/modules/learn-course/hooks/use-course-tree";
import { useLearnCourse } from "@/modules/learn-course/hooks/use-learn-course";
import { useSelectionParam } from "@/modules/learn-course/hooks/use-selection-param";

const COURSE_SELECTION: Selection = { type: "course" };

export default function LearnCourseScreen() {
  const { publicId } = useLocalSearchParams<{ publicId: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [paramSelection, setParamSelection] = useSelectionParam();
  const [hasNavigated, setHasNavigated] = useState(false);
  const [isContentsOpen, setIsContentsOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const {
    course,
    isCoursePending,
    isEnrolled,
    isLoadingEnrollment,
    refetchEnrollmentStatus,
    tree,
    flatLessons,
    isLoadingTree,
    progress,
    isProgressLoading,
    statusById,
    progressPercent,
    hasNoReview,
    handleErrorAction,
  } = useLearnCourse(publicId);

  // A shared topic/lesson link only applies once enrolled and the item exists in the tree.
  const isParamSelectionInTree =
    paramSelection.type === "course" ||
    (paramSelection.type === "topic"
      ? tree.some((topic) => topic.id === paramSelection.id)
      : flatLessons.some((lesson) => lesson.id === paramSelection.id));
  const selection = isEnrolled && isParamSelectionInTree ? paramSelection : COURSE_SELECTION;
  const { previousItem, nextItem } = useAdjacentSelection(tree, selection);

  // Opening the course without a topic/lesson param resumes the last active lesson, until the
  // learner picks something themselves. A finished course has nothing to resume, so it stays on
  // the course overview.
  const resumeLessonId =
    !hasNavigated && paramSelection.type === "course" && progress?.status !== "done"
      ? progress?.lastLessonId
      : undefined;
  const resumeLesson = useEffectEvent((lessonId: string) => {
    setParamSelection({ type: "lesson", id: lessonId });
  });

  useEffect(() => {
    if (resumeLessonId) {
      resumeLesson(resumeLessonId);
    }
  }, [resumeLessonId]);

  // Until the current lesson is known (enrollment, tree, progress, or the resume jump landing in
  // the params), the content shows a skeleton instead of flashing the course overview.
  const isLoadingLesson =
    isLoadingEnrollment || isLoadingTree || isProgressLoading || !!resumeLessonId;

  // Celebrate only when the course turns done during this visit, not when opening a finished one
  // (the previous status is undefined until progress first loads). The dialog fires the confetti.
  const courseStatus = progress?.status;
  const [previousCourseStatus, setPreviousCourseStatus] = useState(courseStatus);
  const [isCompletedDialogOpen, setIsCompletedDialogOpen] = useState(false);
  if (courseStatus !== previousCourseStatus) {
    setPreviousCourseStatus(courseStatus);
    if (previousCourseStatus && previousCourseStatus !== "done" && courseStatus === "done") {
      setIsCompletedDialogOpen(true);
    }
  }
  const isCourseDone = isEnrolled && courseStatus === "done";
  const { celebrateAt } = useCelebrate();

  const { mutateAsync: enroll, isPending: isEnrolling } = useEnrollInCourse();
  const { mutateAsync: withdraw, isPending: isWithdrawing } = useWithdrawFromCourse();

  // The Learn tab lists stay mounted, so they are refreshed here instead of on remount like web.
  function invalidateCourseLists() {
    void queryClient.invalidateQueries({ queryKey: getGetEnrolledCoursesQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getGetCoursesQueryKey() });
  }

  function setSelection(next: Selection) {
    setHasNavigated(true);
    setParamSelection(next);
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  async function handleEnroll() {
    try {
      await enroll({ data: { publicId } });
      await refetchEnrollmentStatus();
      invalidateCourseLists();
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleWithdraw() {
    try {
      await withdraw({ pathParams: { publicId } });
      setSelection(COURSE_SELECTION);
      await refetchEnrollmentStatus();
      invalidateCourseLists();
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  function handleSelect(next: Selection) {
    if (isEnrolled) {
      setSelection(next);
    }
  }

  function handlePrevious() {
    if (previousItem) {
      setSelection(previousItem);
    }
  }

  function handleNext() {
    if (nextItem) {
      setSelection(nextItem);
    }
  }

  function handleOpenReview() {
    setIsCompletedDialogOpen(false);
    setIsReviewDialogOpen(true);
  }

  function handleOpenReviews() {
    router.push(`/learn/${publicId}/reviews`);
  }

  function handleOpenContents() {
    setIsContentsOpen(true);
  }

  function handleCloseContents() {
    setIsContentsOpen(false);
  }

  if (isCoursePending) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <LearnReaderSkeleton />
      </SafeAreaView>
    );
  }

  if (!course || course.status !== "published") {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text>{t("learn.detail.notFound")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <LearnHeader
        title={course.name}
        onBack={handleBack}
        isEnrolled={isEnrolled}
        isEnrolling={isEnrolling}
        onEnroll={handleEnroll}
        isWithdrawing={isWithdrawing}
        onWithdraw={handleWithdraw}
        onReview={handleOpenReview}
        isLoadingEnrollment={isLoadingEnrollment}
        progressPercent={progressPercent}
      />

      {/* Quiz text answers: taps on Next/Submit work with the keyboard open, and it doesn't cover the input */}
      <KeyboardAwareScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bottomOffset={16}
      >
        {isLoadingLesson ? (
          <LearnContentSkeleton />
        ) : (
          // A finished course keeps celebrating: taps outside buttons/inputs burst confetti there.
          <Pressable accessible={false} disabled={!isCourseDone} onPress={celebrateAt}>
            <LearnContent
              selection={selection}
              course={course}
              tree={tree}
              flatLessons={flatLessons}
              isEnrolled={isEnrolled}
              progress={progress}
            />
          </Pressable>
        )}
      </KeyboardAwareScrollView>

      {!isLoadingLesson && isEnrolled && progress && selection.type === "lesson" && (
        <LearnNextStep
          publicId={publicId}
          courseId={course.id}
          lessonId={selection.id}
          progress={progress}
        />
      )}

      <CourseCompletedDialog
        open={isCompletedDialogOpen}
        onOpenChange={setIsCompletedDialogOpen}
        onReview={hasNoReview ? handleOpenReview : undefined}
      />
      {isEnrolled && (
        <ReviewDialog
          publicId={publicId}
          open={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
        />
      )}

      <LearnBottomBar
        hasPrevious={isEnrolled && !!previousItem}
        hasNext={isEnrolled && !!nextItem}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onOpenContents={handleOpenContents}
      />

      <LearnTreeSheet
        open={isContentsOpen}
        onClose={handleCloseContents}
        courseName={course.name}
        tree={tree}
        selection={selection}
        contentLocked={!isEnrolled}
        isLoadingTree={isLoadingTree}
        courseStatus={progress?.status}
        statusById={statusById}
        onSelect={handleSelect}
        onOpenReviews={handleOpenReviews}
      />
    </SafeAreaView>
  );
}
