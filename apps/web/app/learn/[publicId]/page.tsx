"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useEnrollInCourse,
  useGetEnrolledCourseLessons,
  useGetEnrolledCourseTopics,
  useGetEnrollmentStatus,
  useGetPublicCourseByPublicId,
  useGetPublicCourseLessons,
  useGetPublicCourseTopics,
  useGetUserSelf,
  useWithdrawFromCourse,
} from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { SidebarProvider } from "@repo/ui-web/components/sidebar";
import { toast } from "@repo/ui-web/components/sonner";
import { useErrorHandlingAction } from "@repo/shared";
import { useAdjacentSelection, useCourseTree } from "@/app/courses/hooks/use-course-tree";
import type { Selection } from "@/app/courses/types";
import { LearnBottomNav } from "./components/learn-bottom-nav";
import { LearnHeader } from "./components/learn-header";
import { LearnTreeNav } from "./components/learn-tree-nav";
import { LearnWorkingArea } from "./components/learn-working-area";

export default function LearnCourseDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const router = useRouter();
  const { t } = useT();
  const [selection, setSelection] = useState<Selection>({ type: "course" });

  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });

  const { data: currentUser, isPending: isUserPending } = useGetUserSelf({
    query: { retry: false },
  });
  const isLoggedIn = !!currentUser;

  const { data: course, isPending: isCoursePending } = useGetPublicCourseByPublicId({ publicId });

  const {
    data: enrollmentStatus,
    isPending: isEnrollmentStatusPending,
    refetch: refetchEnrollmentStatus,
  } = useGetEnrollmentStatus({ publicId }, { query: { enabled: isLoggedIn, retry: false } });
  const isEnrolled = !!enrollmentStatus?.enrolled;
  const isLoadingEnrollment = isUserPending || (isLoggedIn && isEnrollmentStatusPending);

  const { data: publicTopics } = useGetPublicCourseTopics(
    { publicId },
    { query: { enabled: !isEnrolled } }
  );
  const { data: publicLessons } = useGetPublicCourseLessons(
    { publicId },
    { query: { enabled: !isEnrolled } }
  );
  const { data: fullTopics, isLoading: isFullTopicsLoading } = useGetEnrolledCourseTopics(
    { publicId },
    { query: { enabled: isEnrolled } }
  );
  const { data: fullLessons, isLoading: isFullLessonsLoading } = useGetEnrolledCourseLessons(
    { publicId },
    { query: { enabled: isEnrolled } }
  );

  const topics = isEnrolled
    ? fullTopics
    : publicTopics?.map((topic) => ({ ...topic, description: null }));
  const lessons = isEnrolled
    ? fullLessons
    : publicLessons?.map((lesson) => ({ ...lesson, description: null }));
  const isLoadingTree = isEnrolled && (isFullTopicsLoading || isFullLessonsLoading);

  const tree = useCourseTree(topics, lessons);
  const flatLessons = tree.flatMap((topic) => topic.lessons);
  const { previousItem, nextItem } = useAdjacentSelection(tree, selection);

  const { mutateAsync: enroll, isPending: isEnrolling } = useEnrollInCourse();
  const { mutateAsync: withdraw, isPending: isWithdrawing } = useWithdrawFromCourse();

  function handleBack() {
    router.push("/learn");
  }

  async function handleEnroll() {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    try {
      await enroll({ data: { publicId } });
      await refetchEnrollmentStatus();
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

  if (isCoursePending) {
    return (
      <div className="flex min-h-svh flex-1 items-center justify-center">
        {t("courses.loading")}
      </div>
    );
  }

  if (!course || course.status !== "published") {
    return (
      <div className="flex min-h-svh flex-1 items-center justify-center">
        {t("learn.detail.notFound")}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-svh flex-1 flex-row">
        <LearnTreeNav
          courseName={course.name}
          tree={tree}
          selection={selection}
          contentLocked={!isEnrolled}
          isLoadingTree={isLoadingTree}
          onSelectCourse={() => setSelection({ type: "course" })}
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
            isLoadingEnrollment={isLoadingEnrollment}
          />

          <LearnWorkingArea
            selection={selection}
            course={course}
            tree={tree}
            flatLessons={flatLessons}
            onSelectLesson={handleSelectLesson}
          />

          <LearnBottomNav
            hasPrevious={isEnrolled && !!previousItem}
            hasNext={isEnrolled && !!nextItem}
            onPrevious={() => previousItem && setSelection(previousItem)}
            onNext={() => nextItem && setSelection(nextItem)}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
