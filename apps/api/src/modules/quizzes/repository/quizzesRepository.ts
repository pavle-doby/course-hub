import { and, eq } from "drizzle-orm";
import { db, schema } from "@repo/db";
import type { QuizAnswers, QuizEntity, QuizQuestion, QuizResponseEntity } from "@repo/db-schema";
import type { QuizParentParams } from "@repo/contract";

const parentColumns = {
  course: schema.quizzes.courseId,
  topic: schema.quizzes.topicId,
  lesson: schema.quizzes.lessonId,
} as const;

const parentKeys = { course: "courseId", topic: "topicId", lesson: "lessonId" } as const;

export const quizzesRepository = {
  getByParent: async (parent: QuizParentParams): Promise<QuizEntity | undefined> => {
    return await db.query.quizzes.findFirst({
      where: eq(parentColumns[parent.parentType], parent.parentId),
    });
  },

  upsert: async (parent: QuizParentParams, questions: QuizQuestion[]): Promise<QuizEntity> => {
    const [quiz] = await db
      .insert(schema.quizzes)
      .values({ [parentKeys[parent.parentType]]: parent.parentId, questions })
      .onConflictDoUpdate({
        target: parentColumns[parent.parentType],
        set: { questions, updatedAt: new Date() },
      })
      .returning();
    return quiz!;
  },

  deleteByParent: async (parent: QuizParentParams): Promise<void> => {
    await db
      //
      .delete(schema.quizzes)
      .where(eq(parentColumns[parent.parentType], parent.parentId));
  },

  getResponse: async (userId: string, quizId: string): Promise<QuizResponseEntity | undefined> => {
    return await db.query.quizResponses.findFirst({
      where: and(eq(schema.quizResponses.userId, userId), eq(schema.quizResponses.quizId, quizId)),
    });
  },

  saveResponse: async (
    userId: string,
    quizId: string,
    answers: QuizAnswers
  ): Promise<QuizResponseEntity> => {
    const [response] = await db
      .insert(schema.quizResponses)
      .values({ userId, quizId, answers })
      .onConflictDoUpdate({
        target: [schema.quizResponses.userId, schema.quizResponses.quizId],
        set: { answers, updatedAt: new Date() },
      })
      .returning();
    return response!;
  },

  deleteResponse: async (userId: string, quizId: string): Promise<void> => {
    await db
      .delete(schema.quizResponses)
      .where(and(eq(schema.quizResponses.userId, userId), eq(schema.quizResponses.quizId, quizId)));
  },
};
