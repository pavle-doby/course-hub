import { ErrorCodeReview } from "@repo/contract";

export const reviewErrorMessages = {
  [ErrorCodeReview.NOT_FOUND]: {
    title: "errors.review.NOT_FOUND.title",
    message: "errors.review.NOT_FOUND.message",
  },
} as const satisfies Record<ErrorCodeReview, { title: string; message: string }>;
