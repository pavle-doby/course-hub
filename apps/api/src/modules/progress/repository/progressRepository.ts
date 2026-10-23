import { db, schema } from "@repo/db";
import { and, eq, inArray, isNull, or, type SQL } from "drizzle-orm";
import {
  LessonProgress,
  LessonProgressStatus,
  QuizAnswers,
  UpdateLessonProgressReq,
} from "@repo/contract";
import type { CourseContent } from "../services/deriveCourseProgress";

export type LearnerRows = {
  lessons: {
    userId: string;
    lessonId: string;
    status: LessonProgressStatus;
    progressSeconds: number;
    videoWatchedAt: Date | null;
    updatedAt: Date;
  }[];
  topics: { userId: string; topicId: string; videoWatchedAt: Date | null }[];
  quizResponses: { userId: string; quizId: string; answers: QuizAnswers }[];
};

const lessonProgressColumns = {
  lessonId: schema.lessonProgress.lessonId,
  status: schema.lessonProgress.status,
  progressSeconds: schema.lessonProgress.progressSeconds,
};

function toUtcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Quizzes on the course itself, on one of its topics, or on one of its lessons.
function courseQuizzes(courseId: string): SQL | undefined {
  const courseTopicIds = db
    .select({ id: schema.topics.id })
    .from(schema.topics)
    .where(eq(schema.topics.courseId, courseId));
  const courseLessonIds = db
    .select({ id: schema.lessons.id })
    .from(schema.lessons)
    .where(inArray(schema.lessons.topicId, courseTopicIds));
  return or(
    eq(schema.quizzes.courseId, courseId),
    inArray(schema.quizzes.topicId, courseTopicIds),
    inArray(schema.quizzes.lessonId, courseLessonIds)
  );
}

export const progressRepository = {
  getLessonCourseId: async (lessonId: string): Promise<string | undefined> => {
    const [row] = await db
      .select({ courseId: schema.topics.courseId })
      .from(schema.lessons)
      .innerJoin(schema.topics, eq(schema.lessons.topicId, schema.topics.id))
      .where(eq(schema.lessons.id, lessonId))
      .limit(1);
    return row?.courseId;
  },

  // Whether the lesson has a playable video and whether the user watched it to the end.
  getLessonVideoState: async (
    userId: string,
    lessonId: string
  ): Promise<{ hasVideo: boolean; isVideoWatched: boolean }> => {
    const [row] = await db
      .select({
        videoId: schema.videos.id,
        videoWatchedAt: schema.lessonProgress.videoWatchedAt,
      })
      .from(schema.lessons)
      .leftJoin(
        schema.videos,
        and(eq(schema.videos.lessonId, schema.lessons.id), eq(schema.videos.status, "ready"))
      )
      .leftJoin(
        schema.lessonProgress,
        and(
          eq(schema.lessonProgress.lessonId, schema.lessons.id),
          eq(schema.lessonProgress.userId, userId)
        )
      )
      .where(eq(schema.lessons.id, lessonId));
    return { hasVideo: Boolean(row?.videoId), isVideoWatched: Boolean(row?.videoWatchedAt) };
  },

  // Upserts the lesson row and records today as an active day for the course.
  saveLessonProgress: async (
    userId: string,
    lessonId: string,
    courseId: string,
    data: UpdateLessonProgressReq
  ): Promise<LessonProgress> => {
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
      const videoFields = data.videoWatched && { videoWatchedAt: now };

      const [progress] = await tx
        .insert(schema.lessonProgress)
        .values({ userId, lessonId, ...statusFields, ...positionFields, ...videoFields })
        .onConflictDoUpdate({
          target: [schema.lessonProgress.userId, schema.lessonProgress.lessonId],
          set: { ...statusFields, ...positionFields, ...videoFields, updatedAt: now },
        })
        .returning(lessonProgressColumns);

      await tx
        .insert(schema.learnerActivityDays)
        .values({ userId, courseId, day: toUtcDay(now) })
        .onConflictDoNothing();

      return progress!;
    });
  },

  saveTopicVideoWatched: async (userId: string, topicId: string): Promise<void> => {
    const now = new Date();
    await db
      .insert(schema.topicProgress)
      .values({ userId, topicId, videoWatchedAt: now })
      .onConflictDoUpdate({
        target: [schema.topicProgress.userId, schema.topicProgress.topicId],
        set: { videoWatchedAt: now, updatedAt: now },
      });
  },

  // ponytail: the day is the UTC date, not the learner's local one.
  touchActivityDay: async (userId: string, courseId: string): Promise<void> => {
    await db
      .insert(schema.learnerActivityDays)
      .values({ userId, courseId, day: toUtcDay(new Date()) })
      .onConflictDoNothing();
  },

  getTopicCourseId: async (topicId: string): Promise<string | undefined> => {
    const [row] = await db
      .select({ courseId: schema.topics.courseId })
      .from(schema.topics)
      .where(eq(schema.topics.id, topicId))
      .limit(1);
    return row?.courseId;
  },

  // Topics, lessons (with whether a ready video exists) and quizzes of a course.
  getCourseContent: async (courseId: string): Promise<CourseContent> => {
    const [topicRows, lessonRows, quizRows] = await Promise.all([
      db
        .select({ id: schema.topics.id, videoId: schema.videos.id })
        .from(schema.topics)
        .leftJoin(
          schema.videos,
          and(eq(schema.videos.topicId, schema.topics.id), eq(schema.videos.status, "ready"))
        )
        .where(eq(schema.topics.courseId, courseId)),
      db
        .select({
          id: schema.lessons.id,
          topicId: schema.lessons.topicId,
          videoId: schema.videos.id,
        })
        .from(schema.lessons)
        .innerJoin(schema.topics, eq(schema.lessons.topicId, schema.topics.id))
        .leftJoin(
          schema.videos,
          and(eq(schema.videos.lessonId, schema.lessons.id), eq(schema.videos.status, "ready"))
        )
        .where(eq(schema.topics.courseId, courseId)),
      db
        .select({
          id: schema.quizzes.id,
          topicId: schema.quizzes.topicId,
          lessonId: schema.quizzes.lessonId,
          questions: schema.quizzes.questions,
        })
        .from(schema.quizzes)
        .where(courseQuizzes(courseId)),
    ]);

    return {
      topics: topicRows.map(({ id, videoId }) => ({ id, hasVideo: Boolean(videoId) })),
      lessons: lessonRows.map(({ id, topicId, videoId }) => ({
        id,
        topicId,
        hasVideo: Boolean(videoId),
      })),
      quizzes: quizRows,
    };
  },

  // Saved progress rows of the given learners in a course.
  getLearnerRows: async (courseId: string, userIds: string[]): Promise<LearnerRows> => {
    if (userIds.length === 0) {
      return { lessons: [], topics: [], quizResponses: [] };
    }
    const [lessonRows, topicRows, responseRows] = await Promise.all([
      db
        .select({
          userId: schema.lessonProgress.userId,
          lessonId: schema.lessonProgress.lessonId,
          status: schema.lessonProgress.status,
          progressSeconds: schema.lessonProgress.progressSeconds,
          videoWatchedAt: schema.lessonProgress.videoWatchedAt,
          updatedAt: schema.lessonProgress.updatedAt,
        })
        .from(schema.lessonProgress)
        .innerJoin(schema.lessons, eq(schema.lessonProgress.lessonId, schema.lessons.id))
        .innerJoin(schema.topics, eq(schema.lessons.topicId, schema.topics.id))
        .where(
          and(eq(schema.topics.courseId, courseId), inArray(schema.lessonProgress.userId, userIds))
        ),
      db
        .select({
          userId: schema.topicProgress.userId,
          topicId: schema.topicProgress.topicId,
          videoWatchedAt: schema.topicProgress.videoWatchedAt,
        })
        .from(schema.topicProgress)
        .innerJoin(schema.topics, eq(schema.topicProgress.topicId, schema.topics.id))
        .where(
          and(eq(schema.topics.courseId, courseId), inArray(schema.topicProgress.userId, userIds))
        ),
      db
        .select({
          userId: schema.quizResponses.userId,
          quizId: schema.quizResponses.quizId,
          answers: schema.quizResponses.answers,
        })
        .from(schema.quizResponses)
        .innerJoin(schema.quizzes, eq(schema.quizResponses.quizId, schema.quizzes.id))
        .where(and(courseQuizzes(courseId), inArray(schema.quizResponses.userId, userIds))),
    ]);
    return { lessons: lessonRows, topics: topicRows, quizResponses: responseRows };
  },

  // Sets or clears the enrollment's completedAt. Returns true only when this call newly completed it.
  setEnrollmentCompleted: async (
    userId: string,
    courseId: string,
    isDone: boolean
  ): Promise<boolean> => {
    // A done course only stamps enrollments not completed yet, so a returned row means
    // this call is the one that completed it.
    const updated = await db
      .update(schema.courseEnrollments)
      .set({ completedAt: isDone ? new Date() : null })
      .where(
        and(
          eq(schema.courseEnrollments.userId, userId),
          eq(schema.courseEnrollments.courseId, courseId),
          isNull(schema.courseEnrollments.withdrawnAt),
          isDone ? isNull(schema.courseEnrollments.completedAt) : undefined
        )
      )
      .returning({ id: schema.courseEnrollments.id });
    return isDone && updated.length > 0;
  },
};
