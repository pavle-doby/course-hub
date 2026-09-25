import {
  ErrorCode,
  ErrorCodeEnrollment,
  ErrorCodeQuiz,
  ForbiddenError,
  NotFoundError,
  type GenerateQuizReq,
  type GenerateQuizRes,
  type GetPublicQuizRes,
  type GetQuizRes,
  type MyQuizResponseRes,
  type Quiz,
  type QuizParentParams,
  type SaveQuizReq,
  type SaveQuizResponseReq,
  type SaveQuizRes,
} from "@repo/contract";
import type { QuizEntity, QuizResponseEntity } from "@repo/db-schema";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { documentsRepository } from "api/modules/documents/repository/documentsRepository";
import { coursesRepository } from "api/modules/courses/repository/coursesRepository";
import { enrollmentsRepository } from "api/modules/enrollments/repository/enrollmentsRepository";
import { progressService } from "api/modules/progress/services/progressService";
import { consumeAiUsage } from "api/modules/ai/usage";
import { quizzesRepository } from "../repository/quizzesRepository";
import { quizGenerator } from "./quizGenerator";
import { scoreQuiz } from "./scoreQuiz";

const DAILY_GENERATION_LIMIT = 20;

// ##################################################################################
// #region Private Helpers
// ##################################################################################

async function getUserId(authUserId: string): Promise<string> {
  const user = await usersRepository.getUserByAuthUserId(authUserId);
  if (!user) {
    throw new ForbiddenError({ code: ErrorCode.FORBIDDEN });
  }
  return user.id;
}

async function getParentCourse(
  parent: QuizParentParams
): Promise<{ creatorId: string; courseId: string }> {
  const course = await documentsRepository.getParentCreator(parent);
  if (!course) {
    throw new NotFoundError({ code: ErrorCodeQuiz.PARENT_NOT_FOUND });
  }
  return course;
}

// Resolves parent → course and checks the caller created it
async function assertCreator(
  parent: QuizParentParams,
  authUserId: string
): Promise<{ userId: string; courseId: string }> {
  const userId = await getUserId(authUserId);
  const { creatorId, courseId } = await getParentCourse(parent);
  if (creatorId !== userId) {
    throw new ForbiddenError({ code: ErrorCode.FORBIDDEN });
  }
  return { userId, courseId };
}

async function getQuizOrThrow(parent: QuizParentParams): Promise<QuizEntity> {
  const quiz = await quizzesRepository.getByParent(parent);
  if (!quiz) {
    throw new NotFoundError({ code: ErrorCodeQuiz.NOT_FOUND });
  }
  return quiz;
}

function toQuiz({ id, questions, updatedAt }: QuizEntity): Quiz {
  return { id, questions, updatedAt };
}

function toMyResponse(
  quiz: QuizEntity,
  response: QuizResponseEntity | undefined
): MyQuizResponseRes {
  if (!response) {
    return { response: null };
  }
  return {
    response: {
      answers: response.answers,
      result: scoreQuiz(quiz.questions, response.answers),
      updatedAt: response.updatedAt,
    },
  };
}

// ##################################################################################
// #endregion Private Helpers
// ##################################################################################

export const quizzesService = {
  getQuiz: async (parent: QuizParentParams, authUserId: string): Promise<GetQuizRes> => {
    await assertCreator(parent, authUserId);
    const quiz = await quizzesRepository.getByParent(parent);
    return { quiz: quiz ? toQuiz(quiz) : null };
  },

  saveQuiz: async (
    parent: QuizParentParams,
    dto: SaveQuizReq,
    authUserId: string
  ): Promise<SaveQuizRes> => {
    await assertCreator(parent, authUserId);
    return toQuiz(await quizzesRepository.upsert(parent, dto.questions));
  },

  deleteQuiz: async (parent: QuizParentParams, authUserId: string): Promise<void> => {
    await assertCreator(parent, authUserId);
    await quizzesRepository.deleteByParent(parent);
  },

  generateQuiz: async (
    parent: QuizParentParams,
    dto: GenerateQuizReq,
    authUserId: string
  ): Promise<GenerateQuizRes> => {
    const { userId, courseId } = await assertCreator(parent, authUserId);
    consumeAiUsage(userId, DAILY_GENERATION_LIMIT);
    const [tree, preferences] = await Promise.all([
      coursesRepository.getCourseTree(courseId),
      usersRepository.getUserPreferences(userId),
    ]);
    if (!tree) {
      throw new NotFoundError({ code: ErrorCodeQuiz.PARENT_NOT_FOUND });
    }
    return await quizGenerator.generateQuiz(
      tree,
      parent,
      preferences?.language ?? "en",
      dto.instructions
    );
  },

  // Learner view: same visibility as public documents; correct flags stripped
  getPublicQuiz: async (parent: QuizParentParams): Promise<GetPublicQuizRes> => {
    const quiz = await quizzesRepository.getByParent(parent);
    if (!quiz) {
      return { quiz: null };
    }
    return {
      quiz: {
        id: quiz.id,
        questions: quiz.questions.map((question) => ({
          id: question.id,
          type: question.type,
          prompt: question.prompt,
          description: question.description,
          required: question.required,
          choices:
            question.type === "text"
              ? []
              : question.choices.map(({ value, label }) => ({ value, label })),
        })),
      },
    };
  },

  getMyResponse: async (
    parent: QuizParentParams,
    authUserId: string
  ): Promise<MyQuizResponseRes> => {
    const userId = await getUserId(authUserId);
    const quiz = await getQuizOrThrow(parent);
    const response = await quizzesRepository.getResponse(userId, quiz.id);
    return toMyResponse(quiz, response);
  },

  saveMyResponse: async (
    parent: QuizParentParams,
    dto: SaveQuizResponseReq,
    authUserId: string
  ): Promise<MyQuizResponseRes> => {
    const userId = await getUserId(authUserId);
    const { courseId } = await getParentCourse(parent);
    const enrollment = await enrollmentsRepository.getEnrollment(userId, courseId);
    if (!enrollment || enrollment.withdrawnAt) {
      throw new NotFoundError({ code: ErrorCodeEnrollment.NOT_ENROLLED });
    }
    const quiz = await getQuizOrThrow(parent);
    const response = await quizzesRepository.saveResponse(userId, quiz.id, dto.answers);
    if (parent.parentType === "lesson") {
      await progressService.syncLessonStatus(authUserId, parent.parentId);
    }
    return toMyResponse(quiz, response);
  },

  clearMyResponse: async (parent: QuizParentParams, authUserId: string): Promise<void> => {
    const userId = await getUserId(authUserId);
    const quiz = await getQuizOrThrow(parent);
    await quizzesRepository.deleteResponse(userId, quiz.id);
    if (parent.parentType === "lesson") {
      await progressService.syncLessonStatus(authUserId, parent.parentId);
    }
  },
};
