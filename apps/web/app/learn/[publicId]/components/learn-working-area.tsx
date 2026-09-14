"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Lesson } from "@repo/api-client";
import { useGetVideoByParent } from "@repo/api-client";
import { Button } from "@repo/ui-web/components/button";
import { useT } from "@repo/i18n/client";
import type { Selection, TopicWithLessons } from "@/hooks/use-course-tree";
import { getVideoRefetchInterval } from "@/utils/get-video-refetch-interval";

type LearnWorkingAreaProps = {
  selection: Selection;
  course: { id: string; name: string; description?: string | null };
  tree: TopicWithLessons[];
  flatLessons: Lesson[];
  isEnrolled: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function LearnWorkingArea({
  selection,
  course,
  tree,
  flatLessons,
  isEnrolled,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: LearnWorkingAreaProps) {
  const { t } = useT();

  const selectedTopic =
    selection.type === "topic" ? tree.find((topic) => topic.id === selection.id) : undefined;
  const selectedLesson =
    selection.type === "lesson"
      ? flatLessons.find((lesson) => lesson.id === selection.id)
      : undefined;

  const name =
    selection.type === "course" ? course.name : (selectedTopic?.name ?? selectedLesson?.name);
  const description =
    selection.type === "course"
      ? course.description
      : (selectedTopic?.description ?? selectedLesson?.description);

  const parentByType = {
    topic: selectedTopic && { parentType: "topic" as const, parentId: selectedTopic.id },
    lesson: selectedLesson && { parentType: "lesson" as const, parentId: selectedLesson.id },
    course: { parentType: "course" as const, parentId: course.id },
  };
  const parent = parentByType[selection.type] ?? parentByType.course;

  const { data: video } = useGetVideoByParent(parent, {
    query: {
      enabled: isEnrolled,
      refetchInterval: (query) => {
        return getVideoRefetchInterval(query.state.data?.status);
      },
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="hidden items-center justify-center gap-2 md:flex">
        <Button
          className="min-w-30"
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          onClick={onPrevious}
        >
          <ChevronLeft className="size-4" />
          {t("learn.detail.previous")}
        </Button>
        <Button
          className="min-w-30"
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={onNext}
        >
          {t("learn.detail.next")}
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <h2 className="text-2xl font-semibold">{name}</h2>
        {video?.status === "ready" ? (
          <video
            className="mt-4 aspect-video w-full rounded-lg bg-muted"
            controls
            src={video.playbackUrl}
          />
        ) : video ? (
          <div className="mt-4 flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-input p-4 text-center text-sm text-muted-foreground">
            {video.status === "error"
              ? t("learn.detail.videoUnavailable")
              : t("learn.detail.videoProcessing")}
          </div>
        ) : null}

        <p className="mt-4 whitespace-pre-wrap text-muted-foreground">
          {description || t("learn.detail.noDescription")}
        </p>
      </div>
    </div>
  );
}
