import type { LessonProgressStatus } from "@repo/api-client";

/** Courses fetched per page by the infinite course lists. */
export const COURSE_PAGE_LIMIT = 10;

/** Reviews fetched per page by the course reviews list. */
export const REVIEW_PAGE_LIMIT = 10;

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

/** Next lesson status and its button label key; `done` has no next step. */
export const NEXT_LESSON_STATUS = {
  todo: { status: "in_progress", labelKey: "learn.progress.startLesson" },
  in_progress: { status: "done", labelKey: "learn.progress.completeLesson" },
  done: undefined,
} as const satisfies Record<
  LessonProgressStatus,
  { status: LessonProgressStatus; labelKey: string } | undefined
>;

/** `1.7 seconds` - Interval between firework bursts while the course-completed dialog is open. */
export const FIREWORK_INTERVAL = 1700;

/** Horizontal origin ranges for the left and right firework bursts. */
export const FIREWORK_SIDES = [
  [0.1, 0.3],
  [0.7, 0.9],
] as const;

/** amber-400, for filled rating stars (lucide `fill` is a prop, not a style). */
export const STAR_FILL = "#fbbf24";
