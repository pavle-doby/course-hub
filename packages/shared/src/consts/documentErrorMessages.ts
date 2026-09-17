import { ErrorCodeDocument } from "@repo/contract";

export const documentErrorMessages = {
  [ErrorCodeDocument.NOT_FOUND]: {
    title: "errors.document.NOT_FOUND.title",
    message: "errors.document.NOT_FOUND.message",
  },
  [ErrorCodeDocument.INVALID_PARENT]: {
    title: "errors.document.INVALID_PARENT.title",
    message: "errors.document.INVALID_PARENT.message",
  },
  [ErrorCodeDocument.UNSUPPORTED_TYPE]: {
    title: "errors.document.UNSUPPORTED_TYPE.title",
    message: "errors.document.UNSUPPORTED_TYPE.message",
  },
  [ErrorCodeDocument.FILE_TOO_LARGE]: {
    title: "errors.document.FILE_TOO_LARGE.title",
    message: "errors.document.FILE_TOO_LARGE.message",
  },
  [ErrorCodeDocument.LIMIT_EXCEEDED]: {
    title: "errors.document.LIMIT_EXCEEDED.title",
    message: "errors.document.LIMIT_EXCEEDED.message",
  },
  [ErrorCodeDocument.UPLOAD_NOT_READY]: {
    title: "errors.document.UPLOAD_NOT_READY.title",
    message: "errors.document.UPLOAD_NOT_READY.message",
  },
  [ErrorCodeDocument.UPLOAD_FAILED]: {
    title: "errors.document.UPLOAD_FAILED.title",
    message: "errors.document.UPLOAD_FAILED.message",
  },
} as const satisfies Record<ErrorCodeDocument, { title: string; message: string }>;
