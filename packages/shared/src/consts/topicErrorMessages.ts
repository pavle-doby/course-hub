import { ErrorCodeTopic } from "@repo/contract";

export const topicErrorMessages = {
  [ErrorCodeTopic.NOT_FOUND]: {
    title: "errors.topic.NOT_FOUND.title",
    message: "errors.topic.NOT_FOUND.message",
  },
} as const satisfies Record<ErrorCodeTopic, { title: string; message: string }>;
