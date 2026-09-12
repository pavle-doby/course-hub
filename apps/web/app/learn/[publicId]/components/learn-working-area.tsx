"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Lesson } from "@repo/api-client";
import { Button } from "@repo/ui-web/components/button";
import { useT } from "@repo/i18n/client";
import type { Selection, TopicWithLessons } from "@/hooks/use-course-tree";

type LearnWorkingAreaProps = {
  selection: Selection;
  course: { name: string; description?: string | null };
  tree: TopicWithLessons[];
  flatLessons: Lesson[];
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
        <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
          {description || t("learn.detail.noDescription")}
        </p>
      </div>
    </div>
  );
}
