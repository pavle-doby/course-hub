import { registry } from "api/openapi/registry";
import { PublicQuizOrNullSchema } from "api/openapi/schemas";
import { ApiErrorSchema, QuizParentParamsSchema } from "@repo/contract";

registry.registerPath({
  method: "get",
  path: "/v1/public/quizzes/{parentType}/{parentId}",
  operationId: "getPublicQuiz",
  tags: ["Quizzes"],
  security: [],
  request: { params: QuizParentParamsSchema },
  responses: {
    200: {
      description: "Quiz without correct answers, or null",
      content: { "application/json": { schema: PublicQuizOrNullSchema } },
    },
    default: { description: "Error", content: { "application/json": { schema: ApiErrorSchema } } },
  },
});
