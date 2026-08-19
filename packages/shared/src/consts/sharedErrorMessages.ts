import { ErrorCode } from "@repo/contract";

export const sharedErrorMessages: Record<ErrorCode, { title: string; message: string }> = {
  [ErrorCode.FORBIDDEN]: {
    title: "errors.shared.FORBIDDEN.title",
    message: "errors.shared.FORBIDDEN.message",
  },
  [ErrorCode.UNAUTHORIZED]: {
    title: "errors.shared.UNAUTHORIZED.title",
    message: "errors.shared.UNAUTHORIZED.message",
  },
  [ErrorCode.NOT_FOUND]: {
    title: "errors.shared.NOT_FOUND.title",
    message: "errors.shared.NOT_FOUND.message",
  },
  [ErrorCode.SERVER_ERROR]: {
    title: "errors.shared.SERVER_ERROR.title",
    message: "errors.shared.SERVER_ERROR.message",
  },
  [ErrorCode.NOT_FOUND_ENDPOINT]: {
    title: "errors.shared.NOT_FOUND_ENDPOINT.title",
    message: "errors.shared.NOT_FOUND_ENDPOINT.message",
  },
  [ErrorCode.NO_TOKEN]: {
    title: "errors.shared.NO_TOKEN.title",
    message: "errors.shared.NO_TOKEN.message",
  },
  [ErrorCode.INVALID_TOKEN]: {
    title: "errors.shared.INVALID_TOKEN.title",
    message: "errors.shared.INVALID_TOKEN.message",
  },
  [ErrorCode.AUTH_CHECK_FAILED]: {
    title: "errors.shared.AUTH_CHECK_FAILED.title",
    message: "errors.shared.AUTH_CHECK_FAILED.message",
  },
  [ErrorCode.VALIDATION_ERROR]: {
    title: "errors.shared.VALIDATION_ERROR.title",
    message: "errors.shared.VALIDATION_ERROR.message",
  },
  [ErrorCode.INVALID_PAGINATION_PARAMS]: {
    title: "errors.shared.INVALID_PAGINATION_PARAMS.title",
    message: "errors.shared.INVALID_PAGINATION_PARAMS.message",
  },
};
