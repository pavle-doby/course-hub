import { useMemo } from "react";
import type { Lesson, Topic } from "@repo/api-client";

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
