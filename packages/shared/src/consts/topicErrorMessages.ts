import { ErrorCodeTopic } from "@repo/contract";

export const topicErrorMessages: Record<ErrorCodeTopic, { title: string; message: string }> = {
  [ErrorCodeTopic.NOT_FOUND]: {
    title: "errors.topic.NOT_FOUND.title",
    message: "errors.topic.NOT_FOUND.message",
  },
};
