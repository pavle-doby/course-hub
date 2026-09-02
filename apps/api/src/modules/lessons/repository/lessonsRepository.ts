import { db, schema } from "@repo/db";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import {
  CreateLessonReq,
  GetAllLessonsRes,
  GetLessonRes,
  Lesson,
  LessonGetAllQuerySchema,
  UpdateLessonReq,
} from "@repo/contract";
import { z } from "zod";

type GetAllLessonsParams = {
  offset?: number;
  limit?: number;
  page: number;
  creatorId: string;
  query?: string;
} & z.infer<typeof LessonGetAllQuerySchema>;

const lessonColumns = {
  id: schema.lessons.id,
  topicId: schema.lessons.topicId,
  name: schema.lessons.name,
  description: schema.lessons.description,
  position: schema.lessons.position,
};

export const lessonsRepository = {
  getAllLessons: async ({
    offset,
    limit,
    page,
    creatorId,
    query,
    topicId,
    courseId,
  }: GetAllLessonsParams): Promise<GetAllLessonsRes> => {
    const conditions = [
      eq(schema.courses.creatorId, creatorId),
      query
        ? or(
            ilike(schema.lessons.name, `%${query}%`),
            ilike(schema.lessons.description, `%${query}%`)
          )
        : undefined,
      topicId ? eq(schema.lessons.topicId, topicId) : undefined,
      courseId ? eq(schema.topics.courseId, courseId) : undefined,
    ].filter(Boolean);
    const whereClause = and(...conditions);

    const countResult = await db
      .select({ count: count() })
      .from(schema.lessons)
      .innerJoin(schema.topics, eq(schema.lessons.topicId, schema.topics.id))
      .innerJoin(schema.courses, eq(schema.topics.courseId, schema.courses.id))
      .where(whereClause);
    const total = countResult[0]?.count ?? 0;

    const data = await db
      .select(lessonColumns)
      .from(schema.lessons)
      .innerJoin(schema.topics, eq(schema.lessons.topicId, schema.topics.id))
      .innerJoin(schema.courses, eq(schema.topics.courseId, schema.courses.id))
      .where(whereClause)
      .orderBy(desc(schema.courses.createdAt), asc(schema.lessons.position))
      .offset(offset ?? 0)
      .limit(limit ?? total);

    return { data, pagination: { total, page, limit: limit || total } };
  },

  getLessonById: async (id: string): Promise<GetLessonRes> => {
    return await db.query.lessons.findFirst({
      where: eq(schema.lessons.id, id),
      columns: { createdAt: false, updatedAt: false },
    });
  },

  getLessonsByCourseId: async (courseId: string): Promise<Lesson[]> => {
    return await db
      .select(lessonColumns)
      .from(schema.lessons)
      .innerJoin(schema.topics, eq(schema.lessons.topicId, schema.topics.id))
      .where(eq(schema.topics.courseId, courseId))
      .orderBy(asc(schema.lessons.position));
  },

  createLesson: async (data: CreateLessonReq): Promise<Lesson> => {
    const [lesson] = await db.insert(schema.lessons).values(data).returning(lessonColumns);
    return lesson!;
  },

  updateLesson: async (id: string, data: UpdateLessonReq): Promise<Lesson | undefined> => {
    const [lesson] = await db
      .update(schema.lessons)
      .set(data)
      .where(eq(schema.lessons.id, id))
      .returning(lessonColumns);
    return lesson;
  },

  deleteLesson: async (id: string): Promise<Lesson | undefined> => {
    const [lesson] = await db
      .delete(schema.lessons)
      .where(eq(schema.lessons.id, id))
      .returning(lessonColumns);
    return lesson;
  },
};
