import { and, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, schema } from "@repo/db";

// A lesson's course is two hops away (lesson → topic → course); this alias is the lesson's topic
const lessonTopics = alias(schema.topics, "lesson_topics");

/** Plan usage, counted from existing rows so there are no counters to keep in sync. */
export const plansRepository = {
  countPublishedCourses: async (userId: string): Promise<number> => {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.courses)
      .where(and(eq(schema.courses.creatorId, userId), eq(schema.courses.status, "published")));
    return row?.count ?? 0;
  },

  /** Seconds of video across the user's courses (course, topic and lesson videos). */
  sumVideoSeconds: async (userId: string): Promise<number> => {
    const [row] = await db
      .select({ seconds: sql<number>`coalesce(sum(${schema.videos.durationSeconds}), 0)::int` })
      .from(schema.videos)
      .leftJoin(schema.topics, eq(schema.videos.topicId, schema.topics.id))
      .leftJoin(schema.lessons, eq(schema.videos.lessonId, schema.lessons.id))
      .leftJoin(lessonTopics, eq(schema.lessons.topicId, lessonTopics.id))
      .innerJoin(
        schema.courses,
        eq(
          schema.courses.id,
          sql`coalesce(${schema.videos.courseId}, ${schema.topics.courseId}, ${lessonTopics.courseId})`
        )
      )
      .where(eq(schema.courses.creatorId, userId));
    return row?.seconds ?? 0;
  },

  /**
   * Bytes of the user's ready documents.
   * ponytail: pending uploads aren't counted (abandoned ones would block forever), so uploads
   * started at the same moment can overshoot a little.
   */
  sumDocumentBytes: async (userId: string): Promise<number> => {
    const [row] = await db
      .select({ bytes: sql<number>`coalesce(sum(${schema.documents.sizeBytes}), 0)::bigint` })
      .from(schema.documents)
      .where(
        and(eq(schema.documents.uploadedByUserId, userId), eq(schema.documents.status, "ready"))
      );
    return Number(row?.bytes ?? 0);
  },
};
