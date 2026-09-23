/** `3 seconds` - Refetch interval for video status while it's uploading. */
export const VIDEO_REFETCH_INTERVAL = 3000;

/** `1.5 seconds` - Refetch interval for video status while it's processing. */
export const VIDEO_PROCESSING_REFETCH_INTERVAL = 1500;

/** `10 seconds` - Minimum interval between saving the watched position of a lesson video. */
export const LESSON_VIDEO_SAVE_INTERVAL = 10_000;

/** i18n label key per lesson/topic/course progress status. */
export const PROGRESS_STATUS_LABEL_KEYS = {
  todo: "learn.progress.todo",
  in_progress: "learn.progress.inProgress",
  done: "learn.progress.done",
} as const;
