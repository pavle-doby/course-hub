import { ErrorCodeEnrollment } from "@repo/contract";

export const enrollmentErrorMessages = {
  [ErrorCodeEnrollment.ALREADY_ENROLLED]: {
    title: "errors.enrollment.ALREADY_ENROLLED.title",
    message: "errors.enrollment.ALREADY_ENROLLED.message",
  },
  [ErrorCodeEnrollment.COURSE_NOT_FOUND]: {
    title: "errors.enrollment.COURSE_NOT_FOUND.title",
    message: "errors.enrollment.COURSE_NOT_FOUND.message",
  },
  [ErrorCodeEnrollment.COURSE_PRIVATE]: {
    title: "errors.enrollment.COURSE_PRIVATE.title",
    message: "errors.enrollment.COURSE_PRIVATE.message",
  },
  [ErrorCodeEnrollment.NOT_ENROLLED]: {
    title: "errors.enrollment.NOT_ENROLLED.title",
    message: "errors.enrollment.NOT_ENROLLED.message",
  },
  [ErrorCodeEnrollment.AI_ACCESS_DISABLED]: {
    title: "errors.enrollment.AI_ACCESS_DISABLED.title",
    message: "errors.enrollment.AI_ACCESS_DISABLED.message",
  },
} as const satisfies Record<ErrorCodeEnrollment, { title: string; message: string }>;
