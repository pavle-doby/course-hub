"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetCourseByPublicId, useGetLessons, useGetTopics } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { SidebarProvider } from "@repo/ui-web/components/sidebar";
import { useCourseTree } from "@/app/courses/hooks/use-course-tree";
import type { Selection } from "@/app/courses/types";
import { LearnHeader } from "./components/learn-header";
import { LearnTreeNav } from "./components/learn-tree-nav";
import { LearnWorkingArea } from "./components/learn-working-area";

export default function LearnCourseDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const router = useRouter();
  const { t } = useT();
  const [selection, setSelection] = useState<Selection>({ type: "course" });

  const { data: course, isPending: isCoursePending } = useGetCourseByPublicId({ publicId });
  const id = course?.id;
  const { data: topicsData } = useGetTopics({ courseId: id }, { query: { enabled: !!id } });
  const { data: lessonsData } = useGetLessons({ courseId: id }, { query: { enabled: !!id } });
  const tree = useCourseTree(topicsData?.data, lessonsData?.data);
  const flatLessons = tree.flatMap((topic) => topic.lessons);

  function handleBack() {
    router.push("/learn");
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
          onSelectCourse={() => setSelection({ type: "course" })}
          onSelectTopic={(topicId) => setSelection({ type: "topic", id: topicId })}
          onSelectLesson={(lessonId) => setSelection({ type: "lesson", id: lessonId })}
        />

        <div className="flex flex-1 flex-col">
          <LearnHeader title={course.name} onBack={handleBack} />

          <LearnWorkingArea
            selection={selection}
            course={course}
            tree={tree}
            flatLessons={flatLessons}
            onSelectLesson={(lessonId) => setSelection({ type: "lesson", id: lessonId })}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
