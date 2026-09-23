import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Selection } from "@/hooks/use-course-tree";

/**
 * Tree selection stored in the URL (`?topic=<id>` or `?lesson=<id>`) so a topic or lesson link
 * can be shared. Updates replace the history entry, so browser/header "back" leaves the page.
 */
export function useSelectionSearchParam(): [Selection, (selection: Selection) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson");
  const topicId = searchParams.get("topic");

  const selection = useMemo<Selection>(() => {
    if (lessonId) {
      return { type: "lesson", id: lessonId };
    }
    if (topicId) {
      return { type: "topic", id: topicId };
    }
    return { type: "course" };
  }, [lessonId, topicId]);

  function setSelection(next: Selection) {
    const params = new URLSearchParams(searchParams);
    params.delete("lesson");
    params.delete("topic");
    if (next.type !== "course") {
      params.set(next.type, next.id);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return [selection, setSelection];
}
