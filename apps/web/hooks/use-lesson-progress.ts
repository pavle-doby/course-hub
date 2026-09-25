import { useEffect, useEffectEvent, useRef } from "react";
import type { SyntheticEvent } from "react";
import {
  getGetCourseProgressQueryKey,
  useQueryClient,
  useUpdateLessonProgress,
  type CourseProgress,
  type LessonProgress,
  type LessonProgressStatus,
  type UpdateLessonProgressBody,
} from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingAction } from "@repo/shared";
import { toast } from "@repo/ui-web/components/sonner";
import { LESSON_VIDEO_SAVE_INTERVAL } from "@/utils/consts";

export type SaveLessonProgress = (
  lessonId: string,
  data: UpdateLessonProgressBody,
  onSettled?: () => void
) => void;

/**
 * Saves a lesson's status and/or video position. The saved lesson row is written into the
 * course progress cache; status changes (and a watched video, which derives the status on the
 * server) also refetch it so derived topic/course status updates.
 */
export function useSaveLessonProgress(publicId: string): SaveLessonProgress {
  const { t } = useT();
  const queryClient = useQueryClient();
  const queryKey = getGetCourseProgressQueryKey({ publicId });
  const { mutate } = useUpdateLessonProgress();
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError: ({ title, description }) => toast.error(title, { description }),
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
 * `<video>` handlers that track a lesson video: resume from the saved position, mark the lesson
 * in progress on play, report the video as watched on end (the server then marks the lesson done
 * unless its quiz still needs all right answers), and save the position at most every 10 s, on
 * pause, and when the lesson is left. Without a `lessonId` (course/topic videos) every handler is a no-op.
 */
export function useLessonVideoProgress({ lessonId, progress, onSave }: LessonVideoProgressOptions) {
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

  useEffect(() => {
    return () => {
      flushOnLeave();
    };
  }, [lessonId]);

  function handleLoadedMetadata(event: SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;
    const seconds = progress?.progressSeconds ?? 0;
    if (lessonId && seconds > 0 && seconds < video.duration - 1) {
      video.currentTime = seconds;
    }
  }

  function handlePlay() {
    if (lessonId && (progress?.status ?? "todo") === "todo") {
      onSave(lessonId, { status: "in_progress" satisfies LessonProgressStatus });
    }
  }

  function handleTimeUpdate(event: SyntheticEvent<HTMLVideoElement>) {
    if (!lessonId) {
      return;
    }
    pendingRef.current = { lessonId, seconds: Math.floor(event.currentTarget.currentTime) };
    if (Date.now() - lastSavedAtRef.current >= LESSON_VIDEO_SAVE_INTERVAL) {
      flushPosition();
    }
  }

  function handlePause(event: SyntheticEvent<HTMLVideoElement>) {
    // `pause` also fires right before `ended`; let `handleEnded` save that instead.
    if (!event.currentTarget.ended) {
      flushPosition();
    }
  }

  // ponytail: reaching `ended` counts as watched even if the learner skipped ahead; manual Done
  // is allowed anyway, so tracking watched ranges adds nothing.
  function handleEnded() {
    if (!lessonId) {
      return;
    }
    pendingRef.current = null;
    onSave(lessonId, { videoWatched: true, progressSeconds: 0 });
  }

  return {
    onLoadedMetadata: handleLoadedMetadata,
    onPlay: handlePlay,
    onTimeUpdate: handleTimeUpdate,
    onPause: handlePause,
    onEnded: handleEnded,
  };
}
