import { and, asc, eq, inArray, or } from "drizzle-orm";
import { db, schema } from "@repo/db";
import type { GetDocumentsByParentReq } from "@repo/contract";

const parentColumns = {
  course: schema.documents.courseId,
  topic: schema.documents.topicId,
  lesson: schema.documents.lessonId,
} as const;

export const documentsRepository = {
  getParentCreator: async (parent: GetDocumentsByParentReq) => {
    if (parent.parentType === "course") {
      return await db.query.courses.findFirst({
        where: eq(schema.courses.id, parent.parentId),
        columns: { creatorId: true },
      });
    }

    if (parent.parentType === "topic") {
      const [topic] = await db
        .select({ creatorId: schema.courses.creatorId })
        .from(schema.topics)
        .innerJoin(schema.courses, eq(schema.topics.courseId, schema.courses.id))
        .where(eq(schema.topics.id, parent.parentId));
      return topic;
    }

    const [lesson] = await db
      .select({ creatorId: schema.courses.creatorId })
      .from(schema.lessons)
      .innerJoin(schema.topics, eq(schema.lessons.topicId, schema.topics.id))
      .innerJoin(schema.courses, eq(schema.topics.courseId, schema.courses.id))
      .where(eq(schema.lessons.id, parent.parentId));
    return lesson;
  },

  countByParent: async (parent: GetDocumentsByParentReq) => {
    const documents = await db.query.documents.findMany({
      where: eq(parentColumns[parent.parentType], parent.parentId),
      columns: { id: true },
    });
    return documents.length;
  },

  create: async (data: {
    parent: GetDocumentsByParentReq;
    uploadedByUserId: string;
    objectKey: string;
    originalFileName: string;
    contentType: string;
    sizeBytes: number;
    position: number;
  }) => {
    const parent = {
      course: { courseId: data.parent.parentId },
      topic: { topicId: data.parent.parentId },
      lesson: { lessonId: data.parent.parentId },
    } as const;
    const [document] = await db
      .insert(schema.documents)
      .values({
        ...parent[data.parent.parentType],
        uploadedByUserId: data.uploadedByUserId,
        objectKey: data.objectKey,
        originalFileName: data.originalFileName,
        contentType: data.contentType,
        sizeBytes: data.sizeBytes,
        position: data.position,
      })
      .returning({ id: schema.documents.id });
    return document!;
  },

  getById: async (id: string) => {
    return await db.query.documents.findFirst({ where: eq(schema.documents.id, id) });
  },

  markReady: async (id: string) => {
    const [document] = await db
      .update(schema.documents)
      .set({ status: "ready", updatedAt: new Date() })
      .where(eq(schema.documents.id, id))
      .returning({ id: schema.documents.id });
    return document;
  },

  listReadyByParent: async (parent: GetDocumentsByParentReq) => {
    return await db.query.documents.findMany({
      where: and(
        eq(parentColumns[parent.parentType], parent.parentId),
        eq(schema.documents.status, "ready")
      ),
      orderBy: [asc(schema.documents.position), asc(schema.documents.createdAt)],
    });
  },

  listObjectKeysForCourse: async (courseId: string) => {
    return await db
      .select({ objectKey: schema.documents.objectKey })
      .from(schema.documents)
      .where(
        or(
          eq(schema.documents.courseId, courseId),
          inArray(
            schema.documents.topicId,
            db
              .select({ id: schema.topics.id })
              .from(schema.topics)
              .where(eq(schema.topics.courseId, courseId))
          ),
          inArray(
            schema.documents.lessonId,
            db
              .select({ id: schema.lessons.id })
              .from(schema.lessons)
              .innerJoin(schema.topics, eq(schema.lessons.topicId, schema.topics.id))
              .where(eq(schema.topics.courseId, courseId))
          )
        )
      );
  },

  listObjectKeysForTopic: async (topicId: string) => {
    return await db
      .select({ objectKey: schema.documents.objectKey })
      .from(schema.documents)
      .where(
        or(
          eq(schema.documents.topicId, topicId),
          inArray(
            schema.documents.lessonId,
            db
              .select({ id: schema.lessons.id })
              .from(schema.lessons)
              .where(eq(schema.lessons.topicId, topicId))
          )
        )
      );
  },

  listObjectKeysForLesson: async (lessonId: string) => {
    return await db
      .select({ objectKey: schema.documents.objectKey })
      .from(schema.documents)
      .where(eq(schema.documents.lessonId, lessonId));
  },

  deleteById: async (id: string) => {
    const [document] = await db
      .delete(schema.documents)
      .where(eq(schema.documents.id, id))
      .returning({ id: schema.documents.id });
    return document;
  },

  reorder: async (parent: GetDocumentsByParentReq, documentIds: string[]) => {
    await db.transaction(async (tx) => {
      const documents = await tx.query.documents.findMany({
        where: and(
          eq(parentColumns[parent.parentType], parent.parentId),
          inArray(schema.documents.id, documentIds)
        ),
        columns: { id: true },
      });
      if (documents.length !== documentIds.length) {
        return;
      }

      await Promise.all(
        documentIds.map(async (id, position) => {
          await tx
            .update(schema.documents)
            .set({ position, updatedAt: new Date() })
            .where(eq(schema.documents.id, id));
        })
      );
    });
  },
};
