import { ErrorCodeAuth } from "@repo/contract";

export const authErrorMessages: Record<ErrorCodeAuth, { title: string; message: string }> = {
  [ErrorCodeAuth.INVALID_CREDENTIALS]: {
    title: "errors.auth.INVALID_CREDENTIALS.title",
    message: "errors.auth.INVALID_CREDENTIALS.message",
  },
  [ErrorCodeAuth.UNAUTHORIZED]: {
    title: "errors.auth.UNAUTHORIZED.title",
    message: "errors.auth.UNAUTHORIZED.message",
  },
  [ErrorCodeAuth.USER_EXISTS]: {
    title: "errors.auth.USER_EXISTS.title",
    message: "errors.auth.USER_EXISTS.message",
  },
  [ErrorCodeAuth.NO_REFRESH_TOKEN]: {
    title: "errors.auth.NO_REFRESH_TOKEN.title",
    message: "errors.auth.NO_REFRESH_TOKEN.message",
  },
  [ErrorCodeAuth.INVALID_REFRESH_TOKEN]: {
    title: "errors.auth.INVALID_REFRESH_TOKEN.title",
    message: "errors.auth.INVALID_REFRESH_TOKEN.message",
  },
  [ErrorCodeAuth.USER_NOT_FOUND]: {
    title: "errors.auth.USER_NOT_FOUND.title",
    message: "errors.auth.USER_NOT_FOUND.message",
  },
  [ErrorCodeAuth.BAD_REQUEST]: {
    title: "errors.auth.BAD_REQUEST.title",
    message: "errors.auth.BAD_REQUEST.message",
  },
  [ErrorCodeAuth.RATE_LIMIT_EXCEEDED]: {
    title: "errors.auth.RATE_LIMIT_EXCEEDED.title",
    message: "errors.auth.RATE_LIMIT_EXCEEDED.message",
  },
};
