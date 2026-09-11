import { ErrorCodeCourse } from "@repo/contract";

export const courseErrorMessages: Record<ErrorCodeCourse, { title: string; message: string }> = {
  [ErrorCodeCourse.NOT_FOUND]: {
    title: "errors.course.NOT_FOUND.title",
    message: "errors.course.NOT_FOUND.message",
  },
};
