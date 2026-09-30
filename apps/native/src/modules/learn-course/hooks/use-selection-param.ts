import { useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import type { Selection } from "@/modules/learn-course/hooks/use-course-tree";

/**
 * Tree selection stored in the route params (`?topic=<id>` or `?lesson=<id>`), like web, so
 * shared links and notification deep links open the right item. `setParams` doesn't push a
 * history entry, so "back" leaves the reader.
 */
export function useSelectionParam(): [Selection, (selection: Selection) => void] {
  const { lesson, topic } = useLocalSearchParams<{ lesson?: string; topic?: string }>();

  const selection = useMemo<Selection>(() => {
    if (lesson) {
      return { type: "lesson", id: lesson };
    }
    if (topic) {
      return { type: "topic", id: topic };
    }
    return { type: "course" };
  }, [lesson, topic]);

  function setSelection(next: Selection) {
    router.setParams({
      lesson: next.type === "lesson" ? next.id : undefined,
      topic: next.type === "topic" ? next.id : undefined,
    });
  }

  return [selection, setSelection];
}
