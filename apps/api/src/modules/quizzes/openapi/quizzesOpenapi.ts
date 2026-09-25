import { registry } from "api/openapi/registry";
import {
  GeneratedQuizSchema,
  MyQuizResponseSchema,
  QuizOrNullSchema,
  QuizSchema,
} from "api/openapi/schemas";
import {
  ApiErrorSchema,
  GenerateQuizBodySchema,
  QuizParentParamsSchema,
  SaveQuizBodySchema,
  SaveQuizResponseBodySchema,
} from "@repo/contract";

const errorResponse = {
  description: "Error",
  content: { "application/json": { schema: ApiErrorSchema } },
};

const path = "/v1/quizzes/{parentType}/{parentId}";

registry.registerPath({
  method: "get",
  path,
  operationId: "getQuiz",
  tags: ["Quizzes"],
  security: [{ bearerAuth: [] }],
  request: { params: QuizParentParamsSchema },
  responses: {
    200: {
      description: "Quiz with correct answers (creator only), or null",
      content: { "application/json": { schema: QuizOrNullSchema } },
    },
    default: errorResponse,
  },
});

registry.registerPath({
  method: "put",
  path,
  operationId: "saveQuiz",
  tags: ["Quizzes"],
  security: [{ bearerAuth: [] }],
  request: {
    params: QuizParentParamsSchema,
    body: {
      content: { "application/json": { schema: SaveQuizBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Saved quiz",
      content: { "application/json": { schema: QuizSchema } },
    },
    default: errorResponse,
  },
});

registry.registerPath({
  method: "delete",
  path,
  operationId: "deleteQuiz",
  tags: ["Quizzes"],
  security: [{ bearerAuth: [] }],
  request: { params: QuizParentParamsSchema },
  responses: { 204: { description: "Quiz deleted" }, default: errorResponse },
});

registry.registerPath({
  method: "post",
  path: `${path}/generate`,
  operationId: "generateQuiz",
  tags: ["Quizzes"],
  security: [{ bearerAuth: [] }],
  request: {
    params: QuizParentParamsSchema,
    body: {
      content: { "application/json": { schema: GenerateQuizBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "AI-drafted questions, not saved",
      content: { "application/json": { schema: GeneratedQuizSchema } },
    },
    default: errorResponse,
  },
});

registry.registerPath({
  method: "get",
  path: `${path}/response`,
  operationId: "getMyQuizResponse",
  tags: ["Quizzes"],
  security: [{ bearerAuth: [] }],
  request: { params: QuizParentParamsSchema },
  responses: {
    200: {
      description: "The current user's saved answers and result, or null",
      content: { "application/json": { schema: MyQuizResponseSchema } },
    },
    default: errorResponse,
  },
});

registry.registerPath({
  method: "put",
  path: `${path}/response`,
  operationId: "saveQuizResponse",
  tags: ["Quizzes"],
  security: [{ bearerAuth: [] }],
  request: {
    params: QuizParentParamsSchema,
    body: {
      content: { "application/json": { schema: SaveQuizResponseBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Saved answers and result",
      content: { "application/json": { schema: MyQuizResponseSchema } },
    },
    default: errorResponse,
  },
});

registry.registerPath({
  method: "delete",
  path: `${path}/response`,
  operationId: "deleteQuizResponse",
  tags: ["Quizzes"],
  security: [{ bearerAuth: [] }],
  request: { params: QuizParentParamsSchema },
  responses: { 204: { description: "Answers cleared" }, default: errorResponse },
});
