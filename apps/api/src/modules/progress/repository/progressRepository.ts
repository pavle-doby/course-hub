import { db, schema } from "@repo/db";
import { and, count, eq, isNull, sql } from "drizzle-orm";
import { LessonProgress, LessonProgressStatus, UpdateLessonProgressReq } from "@repo/contract";

export type CourseLessonStatusRow = {
  topicId: string;
  lessonId: string;
  status: LessonProgressStatus;
  progressSeconds: number;
  lastActivityAt: Date | null;
};

const lessonProgressColumns = {
  lessonId: schema.lessonProgress.lessonId,
  status: schema.lessonProgress.status,
  progressSeconds: schema.lessonProgress.progressSeconds,
};

export const progressRepository = {
  // Every lesson in the course with the user's progress; lessons without a row are "todo".
  getCourseLessonStatuses: async (
    userId: string,
    courseId: string
  ): Promise<CourseLessonStatusRow[]> => {
    return await db
      .select({
        topicId: schema.lessons.topicId,
        lessonId: schema.lessons.id,
        status: sql<LessonProgressStatus>`coalesce(${schema.lessonProgress.status}, 'todo')`,
        progressSeconds: sql<number>`coalesce(${schema.lessonProgress.progressSeconds}, 0)`,
        lastActivityAt: schema.lessonProgress.updatedAt,
      })
      .from(schema.lessons)
      .innerJoin(schema.topics, eq(schema.lessons.topicId, schema.topics.id))
      .leftJoin(
        schema.lessonProgress,
        and(
          eq(schema.lessonProgress.lessonId, schema.lessons.id),
          eq(schema.lessonProgress.userId, userId)
        )
      )
      .where(eq(schema.topics.courseId, courseId));
  },

  getLessonCourseId: async (lessonId: string): Promise<string | undefined> => {
    const [row] = await db
      .select({ courseId: schema.topics.courseId })
      .from(schema.lessons)
      .innerJoin(schema.topics, eq(schema.lessons.topicId, schema.topics.id))
      .where(eq(schema.lessons.id, lessonId))
      .limit(1);
    return row?.courseId;
  },

  // Upserts the lesson row; on a status change also syncs course_enrollments.completedAt.
  // `isCourseCompleted` is true only when this save newly completed the course.
  saveLessonProgress: async (
    userId: string,
    lessonId: string,
    courseId: string,
    data: UpdateLessonProgressReq
  ): Promise<{ progress: LessonProgress; isCourseCompleted: boolean }> => {
    return await db.transaction(async (tx) => {
      const now = new Date();
      const statusFields = data.status && {
        status: data.status,
        completedAt: data.status === "done" ? now : null,
      };
      const positionFields = data.progressSeconds !== undefined && {
        progressSeconds: data.progressSeconds,
        lastWatchedAt: now,
      };

      const [progress] = await tx
        .insert(schema.lessonProgress)
        .values({ userId, lessonId, ...statusFields, ...positionFields })
        .onConflictDoUpdate({
          target: [schema.lessonProgress.userId, schema.lessonProgress.lessonId],
          set: { ...statusFields, ...positionFields, updatedAt: now },
        })
        .returning(lessonProgressColumns);

      if (data.status) {
        const [totals] = await tx
          .select({
            lessons: count(),
            notDone: sql<number>`count(*) filter (where ${schema.lessonProgress.status} is distinct from 'done')`,
          })
          .from(schema.lessons)
          .innerJoin(schema.topics, eq(schema.lessons.topicId, schema.topics.id))
          .leftJoin(
            schema.lessonProgress,
            and(
              eq(schema.lessonProgress.lessonId, schema.lessons.id),
              eq(schema.lessonProgress.userId, userId)
            )
          )
          .where(eq(schema.topics.courseId, courseId));

        const isCourseDone = totals!.lessons > 0 && Number(totals!.notDone) === 0;

        // A done course only stamps enrollments not completed yet, so a returned row means
        // this save is the one that completed it.
        const updated = await tx
          .update(schema.courseEnrollments)
          .set({ completedAt: isCourseDone ? now : null })
          .where(
            and(
              eq(schema.courseEnrollments.userId, userId),
              eq(schema.courseEnrollments.courseId, courseId),
              isNull(schema.courseEnrollments.withdrawnAt),
              isCourseDone ? isNull(schema.courseEnrollments.completedAt) : undefined
            )
          )
          .returning({ id: schema.courseEnrollments.id });

        return { progress: progress!, isCourseCompleted: isCourseDone && updated.length > 0 };
      }

      return { progress: progress!, isCourseCompleted: false };
    });
  },
};
