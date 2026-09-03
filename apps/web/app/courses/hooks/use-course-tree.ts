import { useMemo } from "react";
import type { Lesson, Topic } from "@repo/api-client";
import type { Selection } from "../types";

export type TopicWithLessons = Topic & { lessons: Lesson[] };

/** Groups lessons under their topic and sorts both by `position`. */
export function useCourseTree(topics?: Topic[], lessons?: Lesson[]): TopicWithLessons[] {
  return useMemo(() => {
    const sortedTopics = [...(topics ?? [])].sort((a, b) => a.position - b.position);
    return sortedTopics.map((topic) => ({
      ...topic,
      lessons: (lessons ?? [])
        .filter((lesson) => lesson.topicId === topic.id)
        .sort((a, b) => a.position - b.position),
    }));
  }, [topics, lessons]);
}

function isSameSelection(a: Selection, b: Selection): boolean {
  if (a.type !== b.type) return false;
  return a.type === "course" || a.id === (b as { id: string }).id;
}

/** Previous/next selection in course → topic → lesson order, for editor navigation. */
export function useAdjacentSelection(
  tree: TopicWithLessons[],
  selection: Selection
): { previousItem?: Selection; nextItem?: Selection } {
  return useMemo(() => {
    const items: Selection[] = [{ type: "course" }];
    for (const topic of tree) {
      items.push({ type: "topic", id: topic.id });
      for (const lesson of topic.lessons) {
        items.push({ type: "lesson", id: lesson.id });
      }
    }
    const currentIndex = items.findIndex((item) => isSameSelection(item, selection));
    return {
      previousItem: currentIndex > 0 ? items[currentIndex - 1] : undefined,
      nextItem:
        currentIndex >= 0 && currentIndex < items.length - 1 ? items[currentIndex + 1] : undefined,
    };
  }, [tree, selection]);
}
