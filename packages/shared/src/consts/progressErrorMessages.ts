import { ErrorCodeProgress } from "@repo/contract";

export const progressErrorMessages = {
  [ErrorCodeProgress.LESSON_NOT_FOUND]: {
    title: "errors.progress.LESSON_NOT_FOUND.title",
    message: "errors.progress.LESSON_NOT_FOUND.message",
  },
  [ErrorCodeProgress.TOPIC_NOT_FOUND]: {
    title: "errors.progress.TOPIC_NOT_FOUND.title",
    message: "errors.progress.TOPIC_NOT_FOUND.message",
  },
  [ErrorCodeProgress.LESSON_NOT_EARNED]: {
    title: "errors.progress.LESSON_NOT_EARNED.title",
    message: "errors.progress.LESSON_NOT_EARNED.message",
  },
} as const satisfies Record<ErrorCodeProgress, { title: string; message: string }>;
