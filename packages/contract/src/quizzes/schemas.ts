import { z } from "zod";
import { DocumentParentParamsSchema } from "../documents/schemas";

export const QuizParentParamsSchema = DocumentParentParamsSchema;

export const QUESTION_TYPES = ["single", "multiple", "text"] as const;

export const QuizChoiceSchema = z.object({
  value: z.string().trim().min(1).max(50),
  label: z.string().trim().min(1).max(200),
  correct: z.boolean(),
});

const QuestionBaseSchema = z.object({
  // Stable key; the reader uses it as the Quiz item `name` and answer key.
  id: z.string().trim().min(1).max(50),
  prompt: z.string().trim().min(1).max(500),
  description: z.string().trim().max(500).optional(),
  required: z.boolean(),
});

const ChoicesSchema = QuizChoiceSchema.array()
  .min(2)
  .max(6)
  .refine((choices) => new Set(choices.map((choice) => choice.value)).size === choices.length, {
    message: "Choice values must be unique",
  });

export const QuizQuestionSchema = z.discriminatedUnion("type", [
  QuestionBaseSchema.extend({
    type: z.literal("single"),
    choices: ChoicesSchema.refine(
      (choices) => choices.filter((choice) => choice.correct).length === 1,
      { message: "Mark exactly one correct answer" }
    ),
  }),
  QuestionBaseSchema.extend({
    type: z.literal("multiple"),
    choices: ChoicesSchema.refine((choices) => choices.some((choice) => choice.correct), {
      message: "Mark at least one correct answer",
    }),
  }),
  QuestionBaseSchema.extend({ type: z.literal("text") }),
]);

export const SaveQuizBodySchema = z.object({
  questions: QuizQuestionSchema.array()
    .min(1)
    .max(20)
    .refine(
      (questions) => new Set(questions.map((question) => question.id)).size === questions.length,
      { message: "Question ids must be unique" }
    ),
});

// Creator view: includes the `correct` flags.
export const QuizSchema = z.object({
  id: z.uuid(),
  questions: QuizQuestionSchema.array(),
  updatedAt: z.date(),
});

export const QuizOrNullSchema = z.object({
  quiz: QuizSchema.nullable(),
});

// Learner view: `correct` flags stripped so the answers don't leak to the client.
export const PublicQuizQuestionSchema = QuestionBaseSchema.extend({
  type: z.enum(QUESTION_TYPES),
  choices: QuizChoiceSchema.omit({ correct: true }).array(),
});

export const PublicQuizSchema = z.object({
  id: z.uuid(),
  questions: PublicQuizQuestionSchema.array(),
});

export const PublicQuizOrNullSchema = z.object({
  quiz: PublicQuizSchema.nullable(),
});

// Optional creator guidance for AI Create / Regenerate, e.g. "focus on practical examples".
export const GenerateQuizBodySchema = z.object({
  instructions: z.string().trim().max(500).optional(),
});

// What the model returns: no ids or choice values (the server assigns them), flat shape for the model.
export const QuizDraftSchema = z.object({
  questions: z
    .object({
      type: z.enum(QUESTION_TYPES),
      prompt: z.string(),
      description: z.string().optional(),
      choices: z.object({ label: z.string(), correct: z.boolean() }).array(),
    })
    .array(),
});

export const GeneratedQuizSchema = z.object({
  questions: QuizQuestionSchema.array().min(3).max(5),
});

// Question id → chosen value (single / text) or values (multiple).
export const QuizAnswersSchema = z.record(
  z.string().max(50),
  z.union([z.string().max(2000), z.string().max(50).array().max(6)])
);

export const SaveQuizResponseBodySchema = z.object({
  answers: QuizAnswersSchema,
});

export const QuizResultSchema = z.object({
  score: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  questions: z
    .object({
      id: z.string(),
      // null for text questions, which aren't scored
      isCorrect: z.boolean().nullable(),
      correctValues: z.string().array(),
    })
    .array(),
});

export const MyQuizResponseSchema = z.object({
  response: z
    .object({
      answers: QuizAnswersSchema,
      result: QuizResultSchema,
      updatedAt: z.date(),
    })
    .nullable(),
});
