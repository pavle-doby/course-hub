import { ErrorCodeAi } from "@repo/contract";

export const aiErrorMessages = {
  [ErrorCodeAi.INVALID_TOKEN]: {
    title: "errors.ai.INVALID_TOKEN.title",
    message: "errors.ai.INVALID_TOKEN.message",
  },
  [ErrorCodeAi.LIMIT_REACHED]: {
    title: "errors.ai.LIMIT_REACHED.title",
    message: "errors.ai.LIMIT_REACHED.message",
  },
  [ErrorCodeAi.GENERATION_FAILED]: {
    title: "errors.ai.GENERATION_FAILED.title",
    message: "errors.ai.GENERATION_FAILED.message",
  },
} as const satisfies Record<ErrorCodeAi, { title: string; message: string }>;
