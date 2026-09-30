import { useEffect, useEffectEvent, useRef } from "react";
import { useEventListener } from "expo";
import type { VideoPlayer } from "expo-video";
import {
  getGetCourseProgressQueryKey,
  useQueryClient,
  useUpdateLessonProgress,
  type CourseProgress,
  type LessonProgress,
  type LessonProgressStatus,
  type UpdateLessonProgressBody,
} from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { useErrorHandlingAction } from "@repo/shared";
import { LESSON_VIDEO_SAVE_INTERVAL } from "@/utils/consts";
import { showToastError } from "@/utils/toast-error";

export type SaveLessonProgress = (
  lessonId: string,
  data: UpdateLessonProgressBody,
  onSettled?: () => void
) => void;

/**
 * Saves a lesson's status and/or video position (web: `useSaveLessonProgress`). The saved lesson
 * row is written into the course progress cache; status changes (and a watched video, which
 * derives the status on the server) also refetch it so derived topic/course status updates.
 */
export function useSaveLessonProgress(publicId: string): SaveLessonProgress {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const queryKey = getGetCourseProgressQueryKey({ publicId });
  const { mutate } = useUpdateLessonProgress();
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError,
  });

  function updateCachedLesson(saved: LessonProgress) {
    queryClient.setQueryData<CourseProgress>(queryKey, (progress) => {
      if (!progress) {
        return progress;
      }
      return {
        ...progress,
        lessons: progress.lessons.map((lesson) =>
          lesson.lessonId === saved.lessonId ? saved : lesson
        ),
      };
    });
  }

  return function saveLessonProgress(lessonId, data, onSettled) {
    mutate(
      { pathParams: { lessonId }, data },
      {
        onSuccess: (saved) => {
          updateCachedLesson(saved);
          if (data.status || data.videoWatched) {
            void queryClient.invalidateQueries({ queryKey });
          }
        },
        onError: handleErrorAction,
        onSettled,
      }
    );
  };
}

type LessonVideoProgressOptions = {
  lessonId?: string;
  progress?: LessonProgress;
  onSave: SaveLessonProgress;
};

/**
 * Tracks a lesson video on an `expo-video` player (web: `useLessonVideoProgress` on `<video>`):
 * resume from the saved position, mark the lesson in progress on play, report the video as
 * watched on end (the server then marks the lesson done unless its quiz still needs all right
 * answers), and save the position at most every 10 s, on pause, and when the lesson is left.
 * Without a `lessonId` (course/topic videos) nothing is tracked.
 */
export function useLessonVideoProgress(
  player: VideoPlayer,
  { lessonId, progress, onSave }: LessonVideoProgressOptions
) {
  const pendingRef = useRef<{ lessonId: string; seconds: number } | null>(null);
  const lastSavedAtRef = useRef(0);

  function flushPosition() {
    const pending = pendingRef.current;
    if (!pending) {
      return;
    }
    pendingRef.current = null;
    lastSavedAtRef.current = Date.now();
    onSave(pending.lessonId, { progressSeconds: pending.seconds });
  }

  const flushOnLeave = useEffectEvent(flushPosition);

  // The player is released on unmount, so the position comes from the last `timeUpdate`.
  useEffect(() => {
    return () => {
      flushOnLeave();
    };
  }, [lessonId]);

  useEventListener(player, "sourceLoad", ({ duration }) => {
    const seconds = progress?.progressSeconds ?? 0;
    if (lessonId && seconds > 0 && seconds < duration - 1) {
      // A method call instead of assigning `currentTime`, which the React Compiler rejects on a hook argument.
      player.seekBy(seconds - player.currentTime);
    }
  });

  useEventListener(player, "playingChange", ({ isPlaying }) => {
    if (!lessonId) {
      return;
    }
    if (isPlaying) {
      if ((progress?.status ?? "todo") === "todo") {
        onSave(lessonId, { status: "in_progress" satisfies LessonProgressStatus });
      }
      return;
    }
    // Playback also stops at the end; let `playToEnd` save that instead.
    if (player.duration - player.currentTime >= 1) {
      flushPosition();
    }
  });

  useEventListener(player, "timeUpdate", ({ currentTime }) => {
    if (!lessonId) {
      return;
    }
    pendingRef.current = { lessonId, seconds: Math.floor(currentTime) };
    if (Date.now() - lastSavedAtRef.current >= LESSON_VIDEO_SAVE_INTERVAL) {
      flushPosition();
    }
  });

  // ponytail: reaching the end counts as watched even if the learner skipped ahead; manual Done
  // is allowed anyway, so tracking watched ranges adds nothing.
  useEventListener(player, "playToEnd", () => {
    if (!lessonId) {
      return;
    }
    pendingRef.current = null;
    onSave(lessonId, { videoWatched: true, progressSeconds: 0 });
  });
}
