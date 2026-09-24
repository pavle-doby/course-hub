"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  useEnrollInCourse,
  useGetCourseProgress,
  useGetEnrolledCourseLessons,
  useGetEnrolledCourseTopics,
  useGetEnrollmentStatus,
  useGetMyCourseReview,
  useGetPublicCourseByPublicId,
  useGetPublicCourseLessons,
  useGetPublicCourseTopics,
  useGetUserSelf,
  useSubscribeNotifications,
  useWithdrawFromCourse,
} from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { SidebarProvider } from "@repo/ui-web/components/sidebar";
import { toast } from "@repo/ui-web/components/sonner";
import { useIsMobile } from "@repo/ui-web/hooks/use-mobile";
import { useErrorHandlingQuery } from "@repo/shared";
import { useAdjacentSelection, useCourseTree, type Selection } from "@/hooks/use-course-tree";
import { useSelectionSearchParam } from "@/hooks/use-selection-search-param";
import { INTERACTIVE_SELECTOR } from "@/utils/consts";
import { getAccessToken } from "@/utils/token-storage";
import { notificationsService } from "@/services/notifications-service";
import { NotificationPrompt } from "@/components/notification-prompt";
import { CourseCompletedDialog } from "./components/course-completed-dialog";
import { LearnBottomNav } from "./components/learn-bottom-nav";
import { LearnCourseDetailSkeleton } from "./components/learn-course-detail-skeleton";
import { LearnHeader } from "./components/learn-header";
import { LearnTreeNav } from "./components/learn-tree-nav";
import { LearnWorkingArea } from "./components/learn-working-area";
import { ReviewDialog } from "./components/review-dialog";

const COURSE_SELECTION: Selection = { type: "course" };

export default function LearnCourseDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const router = useRouter();
  const { t } = useT();
  const [urlSelection, setUrlSelection] = useSelectionSearchParam();
  const hasRestoredLessonRef = useRef(false);
  const [notificationCourseId, setNotificationCourseId] = useState<string>();
  const [isCompletedDialogOpen, setIsCompletedDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const hasAccessToken = Boolean(getAccessToken());
  const { data: currentUser, isFetching: isUserPending } = useGetUserSelf({
    query: { enabled: hasAccessToken, retry: false },
  });
  const isLoggedIn = !!currentUser;

  const {
    data: course,
    isPending: isCoursePending,
    error: courseError,
  } = useGetPublicCourseByPublicId({ publicId });

  const {
    data: enrollmentStatus,
    isPending: isEnrollmentStatusPending,
    refetch: refetchEnrollmentStatus,
  } = useGetEnrollmentStatus({ publicId }, { query: { enabled: isLoggedIn, retry: false } });
  const isEnrolled = !!enrollmentStatus?.enrolled;
  const isLoadingEnrollment = isUserPending || (isLoggedIn && isEnrollmentStatusPending);

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

  const showToastError = ({ title, description }: { title: string; description: string }) =>
    toast.error(title, { description });

  const { handleErrorAction } = useErrorHandlingQuery({
    t: t as (key: string) => string,
    error: courseError,
    showToastError,
  });

  useErrorHandlingQuery({
    t: t as (key: string) => string,
    error: publicTopicsError,
    showToastError,
  });
  useErrorHandlingQuery({
    t: t as (key: string) => string,
    error: publicLessonsError,
    showToastError,
  });
  useErrorHandlingQuery({
    t: t as (key: string) => string,
    error: fullTopicsError,
    showToastError,
  });
  useErrorHandlingQuery({
    t: t as (key: string) => string,
    error: fullLessonsError,
    showToastError,
  });

  const topics = isEnrolled
    ? fullTopics
    : publicTopics?.map((topic) => ({ ...topic, description: null }));
  const lessons = isEnrolled
    ? fullLessons
    : publicLessons?.map((lesson) => ({ ...lesson, description: null }));
  const isLoadingTree = isEnrolled && (isFullTopicsLoading || isFullLessonsLoading);

  const { data: myReview } = useGetMyCourseReview({ publicId }, { query: { enabled: isEnrolled } });

  const { data: progress } = useGetCourseProgress({ publicId }, { query: { enabled: isEnrolled } });
  const statusById = new Map([
    ...(progress?.topics ?? []).map((topic) => [topic.topicId, topic.status] as const),
    ...(progress?.lessons ?? []).map((lesson) => [lesson.lessonId, lesson.status] as const),
  ]);

  const tree = useCourseTree(topics, lessons);
  const flatLessons = tree.flatMap((topic) => topic.lessons);
  // A shared topic/lesson link only applies once enrolled and the item exists in the tree.
  const isUrlSelectionInTree =
    urlSelection.type === "course" ||
    (urlSelection.type === "topic"
      ? tree.some((topic) => topic.id === urlSelection.id)
      : flatLessons.some((lesson) => lesson.id === urlSelection.id));
  const selection = isEnrolled && isUrlSelectionInTree ? urlSelection : COURSE_SELECTION;
  const { previousItem, nextItem } = useAdjacentSelection(tree, selection);
  const doneLessonCount = (progress?.lessons ?? []).filter(
    (lesson) => lesson.status === "done"
  ).length;
  const progressPercent =
    isEnrolled && progress && flatLessons.length > 0
      ? Math.round((doneLessonCount / flatLessons.length) * 100)
      : undefined;

  // Opening the course without a topic/lesson in the URL resumes the last active lesson, once.
  // A finished course has nothing to resume, so it stays on the course overview.
  const restoreLastLesson = useEffectEvent(() => {
    if (hasRestoredLessonRef.current || !progress) {
      return;
    }
    hasRestoredLessonRef.current = true;
    if (urlSelection.type === "course" && progress.status !== "done" && progress.lastLessonId) {
      setUrlSelection({ type: "lesson", id: progress.lastLessonId });
    }
  });

  useEffect(() => {
    restoreLastLesson();
  }, [progress]);

  // Celebrate only when the course turns done during this visit, not when opening a finished one.
  // On mobile the completion burst shoots up from the bottom center.
  const isMobile = useIsMobile();
  const previousCourseStatusRef = useRef(progress?.status);
  useEffect(() => {
    const previousStatus = previousCourseStatusRef.current;
    previousCourseStatusRef.current = progress?.status;
    if (previousStatus && previousStatus !== "done" && progress?.status === "done") {
      void confetti({
        particleCount: 300,
        spread: 120,
        startVelocity: isMobile ? 70 : 55,
        origin: isMobile ? { x: 0.5, y: 1 } : { y: 0.6 },
      });
      setIsCompletedDialogOpen(true);
    }
  }, [progress?.status, isMobile]);

  // A finished course keeps celebrating: clicks on non-interactive areas burst confetti there.
  const isCourseDone = isEnrolled && progress?.status === "done";
  useEffect(() => {
    if (!isCourseDone) {
      return;
    }
    function handleClick(event: MouseEvent) {
      if ((event.target as Element).closest(INTERACTIVE_SELECTOR)) {
        return;
      }
      void confetti({
        particleCount: 70,
        spread: 70,
        origin: { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight },
      });
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isCourseDone]);

  const { mutateAsync: enroll, isPending: isEnrolling } = useEnrollInCourse();
  const { mutateAsync: withdraw, isPending: isWithdrawing } = useWithdrawFromCourse();
  const { mutateAsync: subscribeNotifications } = useSubscribeNotifications();

  function handleBack() {
    router.back();
  }

  async function handleEnroll() {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    try {
      await enroll({ data: { publicId } });
      await refetchEnrollmentStatus();
      if (course) {
        setNotificationCourseId(course.id);
      }
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  async function handleWithdraw() {
    try {
      await withdraw({ pathParams: { publicId } });
      setSelection({ type: "course" });
      await refetchEnrollmentStatus();
    } catch (error) {
      handleErrorAction(error as Error);
    }
  }

  function setSelection(next: Selection) {
    hasRestoredLessonRef.current = true;
    setUrlSelection(next);
  }

  function handleSelectTopic(topicId: string) {
    if (!isEnrolled) {
      return;
    }
    setSelection({ type: "topic", id: topicId });
  }

  function handleSelectLesson(lessonId: string) {
    if (!isEnrolled) {
      return;
    }
    setSelection({ type: "lesson", id: lessonId });
  }

  function handleNotificationPromptOpenChange(open: boolean) {
    if (!open) {
      setNotificationCourseId(undefined);
    }
  }

  function handleEnableNotifications() {
    if (!notificationCourseId) {
      return;
    }

    void notificationsService
      .enableLearnerNotifications({
        courseId: notificationCourseId,
        subscribeNotifications,
      })
      .catch((error: unknown) => {
        console.error(error);
        if (!(error instanceof Error)) {
          return handleErrorAction(error);
        }
        toast.error(error.message);
      });
  }

  function handleOpenReview() {
    setIsCompletedDialogOpen(false);
    setIsReviewDialogOpen(true);
  }

  function handleSelectCourse() {
    setSelection({ type: "course" });
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

  if (isCoursePending) {
    return <LearnCourseDetailSkeleton />;
  }

  if (!course || course.status !== "published") {
    return (
      <div className="flex min-h-svh flex-1 items-center justify-center">
        {t("learn.detail.notFound")}
      </div>
    );
  }

  return (
    <SidebarProvider className="data-resizing:cursor-col-resize data-resizing:select-none [&[data-resizing]_[data-slot^=sidebar-]]:transition-none">
      <NotificationPrompt
        open={!!notificationCourseId}
        onOpenChange={handleNotificationPromptOpenChange}
        onEnable={handleEnableNotifications}
        description={t("notifications.learnerPrompt")}
      />
      <CourseCompletedDialog
        open={isCompletedDialogOpen}
        onOpenChange={setIsCompletedDialogOpen}
        onReview={myReview && !myReview.review ? handleOpenReview : undefined}
      />
      {isEnrolled && (
        <ReviewDialog
          publicId={publicId}
          open={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
        />
      )}
      <div className="flex min-h-svh flex-1 flex-row">
        <LearnTreeNav
          courseName={course.name}
          reviewsHref={`/learn/${publicId}/reviews`}
          tree={tree}
          selection={selection}
          contentLocked={!isEnrolled}
          isLoadingTree={isLoadingTree}
          courseStatus={isEnrolled ? progress?.status : undefined}
          statusById={isEnrolled ? statusById : new Map()}
          onSelectCourse={handleSelectCourse}
          onSelectTopic={handleSelectTopic}
          onSelectLesson={handleSelectLesson}
        />

        <div className="flex flex-1 flex-col">
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

          <LearnWorkingArea
            selection={selection}
            course={course}
            tree={tree}
            flatLessons={flatLessons}
            isEnrolled={isEnrolled}
            progress={isEnrolled ? progress : undefined}
            hasPrevious={isEnrolled && !!previousItem}
            hasNext={isEnrolled && !!nextItem}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />

          <LearnBottomNav
            hasPrevious={isEnrolled && !!previousItem}
            hasNext={isEnrolled && !!nextItem}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
