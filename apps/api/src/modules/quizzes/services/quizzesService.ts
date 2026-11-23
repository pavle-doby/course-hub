import {
  ErrorCode,
  ErrorCodeEnrollment,
  ErrorCodePlans,
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
import type { QuizEntity, QuizResponseEntity, UserEntity } from "@repo/db-schema";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { documentsRepository } from "api/modules/documents/repository/documentsRepository";
import { coursesRepository } from "api/modules/courses/repository/coursesRepository";
import { enrollmentsRepository } from "api/modules/enrollments/repository/enrollmentsRepository";
import { progressService } from "api/modules/progress/services/progressService";
import { consumeAiUsage } from "api/modules/ai/usage";
import { entitlementsService } from "api/modules/plans/services/entitlementsService";
import { quizzesRepository } from "../repository/quizzesRepository";
import { quizGenerator } from "./quizGenerator";
import { scoreQuiz } from "./scoreQuiz";

// ##################################################################################
// #region Private Helpers
// ##################################################################################

async function getUser(authUserId: string): Promise<UserEntity> {
  const user = await usersRepository.getUserByAuthUserId(authUserId);
  if (!user) {
    throw new ForbiddenError({ code: ErrorCode.FORBIDDEN });
  }
  return user;
}

async function getUserId(authUserId: string): Promise<string> {
  return (await getUser(authUserId)).id;
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

// Saved or cleared answers can finish or reopen the lesson, topic or course they belong to.
async function syncProgress(
  parent: QuizParentParams,
  courseId: string,
  authUserId: string
): Promise<void> {
  if (parent.parentType === "lesson") {
    await progressService.syncLessonStatus(authUserId, parent.parentId);
  } else {
    await progressService.syncCourseQuiz(authUserId, courseId);
  }
}

// Resolves parent → course and checks the caller created it
async function assertCreator(
  parent: QuizParentParams,
  authUserId: string
): Promise<{ user: UserEntity; courseId: string }> {
  const user = await getUser(authUserId);
  const { creatorId, courseId } = await getParentCourse(parent);
  if (creatorId !== user.id) {
    throw new ForbiddenError({ code: ErrorCode.FORBIDDEN });
  }
  return { user, courseId };
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
    const { user, courseId } = await assertCreator(parent, authUserId);
    const userId = user.id;
    // 0 = not in the plan (no AI call made), null = no daily cap
    const dailyLimit = entitlementsService.get(user).aiQuizGenerationsDay as number | null;
    if (dailyLimit === 0) {
      throw new ForbiddenError({ code: ErrorCodePlans.FEATURE_NOT_IN_PLAN });
    }
    if (dailyLimit !== null) {
      consumeAiUsage(userId, dailyLimit);
    }
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
    await syncProgress(parent, courseId, authUserId);
    return toMyResponse(quiz, response);
  },

  clearMyResponse: async (parent: QuizParentParams, authUserId: string): Promise<void> => {
    const userId = await getUserId(authUserId);
    const { courseId } = await getParentCourse(parent);
    const quiz = await getQuizOrThrow(parent);
    await quizzesRepository.deleteResponse(userId, quiz.id);
    await syncProgress(parent, courseId, authUserId);
  },
};
