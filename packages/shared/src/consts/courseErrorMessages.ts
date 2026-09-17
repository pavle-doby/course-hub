import { ErrorCodeCourse } from "@repo/contract";

export const courseErrorMessages = {
  [ErrorCodeCourse.NOT_FOUND]: {
    title: "errors.course.NOT_FOUND.title",
    message: "errors.course.NOT_FOUND.message",
  },
} as const satisfies Record<ErrorCodeCourse, { title: string; message: string }>;
