import { useEffect, useRef, useState } from "react";
import {
  useGetMyLeaderboardNearby,
  type CourseProgress,
  type MyLeaderboardNearby,
} from "@repo/api-client";

export type LeaderboardPlaceChange = {
  before: MyLeaderboardNearby;
  after: MyLeaderboardNearby;
};

function countCompleted(progress: CourseProgress): number {
  return (
    progress.lessons.filter((lesson) => lesson.status === "done").length +
    progress.topics.filter((topic) => topic.status === "done").length +
    (progress.status === "done" ? 1 : 0)
  );
}

/**
 * Watches the course progress; when a lesson, topic or the course becomes done and that moves the
 * learner to another leaderboard place, returns the before/after snapshots to show.
 */
export function useLeaderboardPlaceChange(publicId: string, progress?: CourseProgress) {
  const [placeChange, setPlaceChange] = useState<LeaderboardPlaceChange>();
  const { data: nearby, refetch } = useGetMyLeaderboardNearby(
    { publicId },
    { query: { enabled: !!progress, retry: false } }
  );
  const nearbyRef = useRef(nearby);
  const completedRef = useRef<number>(undefined);

  useEffect(() => {
    nearbyRef.current = nearby;
  }, [nearby]);

  useEffect(() => {
    if (!progress) {
      return;
    }
    const completed = countCompleted(progress);
    const previous = completedRef.current;
    completedRef.current = completed;
    if (previous === undefined || previous === completed) {
      return;
    }
    // Any change refreshes the snapshot; only a new completion can show the dialog.
    const before = nearbyRef.current;
    void refetch().then(({ data: after }) => {
      if (completed > previous && before?.me && after?.me && before.me.place !== after.me.place) {
        setPlaceChange({ before, after });
      }
    });
  }, [progress, refetch]);

  return { placeChange, clearPlaceChange: () => setPlaceChange(undefined) };
}
