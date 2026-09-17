import { ErrorCodeLesson } from "@repo/contract";

export const lessonErrorMessages = {
  [ErrorCodeLesson.NOT_FOUND]: {
    title: "errors.lesson.NOT_FOUND.title",
    message: "errors.lesson.NOT_FOUND.message",
  },
} as const satisfies Record<ErrorCodeLesson, { title: string; message: string }>;
