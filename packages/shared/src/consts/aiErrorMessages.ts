import { ErrorCodeAi } from "@repo/contract";

export const aiErrorMessages = {
  [ErrorCodeAi.INVALID_TOKEN]: {
    title: "errors.ai.INVALID_TOKEN.title",
    message: "errors.ai.INVALID_TOKEN.message",
  },
} as const satisfies Record<ErrorCodeAi, { title: string; message: string }>;
