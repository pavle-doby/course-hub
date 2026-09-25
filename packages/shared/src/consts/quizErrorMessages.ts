import { ErrorCodeQuiz } from "@repo/contract";

export const quizErrorMessages = {
  [ErrorCodeQuiz.NOT_FOUND]: {
    title: "errors.quiz.NOT_FOUND.title",
    message: "errors.quiz.NOT_FOUND.message",
  },
  [ErrorCodeQuiz.PARENT_NOT_FOUND]: {
    title: "errors.quiz.PARENT_NOT_FOUND.title",
    message: "errors.quiz.PARENT_NOT_FOUND.message",
  },
} as const satisfies Record<ErrorCodeQuiz, { title: string; message: string }>;
