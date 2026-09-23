import { ErrorCodeProgress } from "@repo/contract";

export const progressErrorMessages = {
  [ErrorCodeProgress.LESSON_NOT_FOUND]: {
    title: "errors.progress.LESSON_NOT_FOUND.title",
    message: "errors.progress.LESSON_NOT_FOUND.message",
  },
} as const satisfies Record<ErrorCodeProgress, { title: string; message: string }>;
