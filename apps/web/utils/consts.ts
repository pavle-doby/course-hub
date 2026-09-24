import type { LessonProgressStatus } from "@repo/api-client";

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

/** Elements whose clicks never trigger the finished-course confetti. */
export const INTERACTIVE_SELECTOR =
  "button, a, input, select, textarea, label, video, [role='button'], [role='menuitem'], [role='menuitemradio'], [role='option'], [contenteditable='true']";

/** `1.7 seconds` - Interval between firework bursts while the course-completed dialog is open. */
export const FIREWORK_INTERVAL = 1700;

/** Horizontal origin ranges for the left and right firework bursts. */
export const FIREWORK_SIDES = [
  [0.1, 0.3],
  [0.7, 0.9],
] as const;

/**
 * MCP endpoint that coding agents connect to with a personal access token.
 * External-system routes live under `/apix`, next to the web app's `/api`.
 */
export const MCP_URL = `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "/apix")}/v1/mcp`;

/** Claude settings page where users add a custom connector. */
export const CLAUDE_CONNECTORS_SETTINGS_URL = "https://claude.ai/customize/connectors";

/** Where Claude users see and manage their custom connectors. */
export const CLAUDE_CONNECTORS_URL = "https://claude.ai/customize/connectors/yours";

/** Stands in for the token in MCP config snippets until the user pastes it (only its hash is stored). */
export const MCP_TOKEN_PLACEHOLDER = "<YOUR_TOKEN>";
