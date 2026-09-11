import { ErrorCodeLesson } from "@repo/contract";

export const lessonErrorMessages: Record<ErrorCodeLesson, { title: string; message: string }> = {
  [ErrorCodeLesson.NOT_FOUND]: {
    title: "errors.lesson.NOT_FOUND.title",
    message: "errors.lesson.NOT_FOUND.message",
  },
};
