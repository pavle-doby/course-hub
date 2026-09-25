import { z } from "zod";
import {
  GenerateQuizBodySchema,
  GeneratedQuizSchema,
  MyQuizResponseSchema,
  PublicQuizOrNullSchema,
  QuizAnswersSchema,
  QuizDraftSchema,
  QuizOrNullSchema,
  QuizParentParamsSchema,
  QuizQuestionSchema,
  QuizResultSchema,
  QuizSchema,
  SaveQuizBodySchema,
  SaveQuizResponseBodySchema,
} from "./schemas";

export type QuizParentParams = z.infer<typeof QuizParentParamsSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type QuizAnswers = z.infer<typeof QuizAnswersSchema>;
export type QuizResult = z.infer<typeof QuizResultSchema>;
export type QuizDraft = z.infer<typeof QuizDraftSchema>;

// GET /quizzes/:parentType/:parentId → creator view with correct answers, or null
export type GetQuizRes = z.infer<typeof QuizOrNullSchema>;

// PUT /quizzes/:parentType/:parentId → create or replace the quiz
export type SaveQuizReq = z.infer<typeof SaveQuizBodySchema>;
export type SaveQuizRes = Quiz;

// POST /quizzes/:parentType/:parentId/generate → AI draft, nothing saved
export type GenerateQuizReq = z.infer<typeof GenerateQuizBodySchema>;
export type GenerateQuizRes = z.infer<typeof GeneratedQuizSchema>;

// GET /public/quizzes/:parentType/:parentId → learner view without correct answers, or null
export type GetPublicQuizRes = z.infer<typeof PublicQuizOrNullSchema>;

// GET|PUT /quizzes/:parentType/:parentId/response → current user's saved answers + result
export type SaveQuizResponseReq = z.infer<typeof SaveQuizResponseBodySchema>;
export type MyQuizResponseRes = z.infer<typeof MyQuizResponseSchema>;
