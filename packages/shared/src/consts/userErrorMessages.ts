import { ErrorCodeUser } from "@repo/contract";

export const userErrorMessages = {
  [ErrorCodeUser.NOT_FOUND]: {
    title: "errors.user.NOT_FOUND.title",
    message: "errors.user.NOT_FOUND.message",
  },
  [ErrorCodeUser.ALREADY_EXISTS]: {
    title: "errors.user.ALREADY_EXISTS.title",
    message: "errors.user.ALREADY_EXISTS.message",
  },
} as const satisfies Record<ErrorCodeUser, { title: string; message: string }>;
