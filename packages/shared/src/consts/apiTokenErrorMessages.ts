import { ErrorCodeApiToken } from "@repo/contract";

export const apiTokenErrorMessages = {
  [ErrorCodeApiToken.NOT_FOUND]: {
    title: "errors.apiToken.NOT_FOUND.title",
    message: "errors.apiToken.NOT_FOUND.message",
  },
} as const satisfies Record<ErrorCodeApiToken, { title: string; message: string }>;
