import { db, schema } from "@repo/db";
import type {
  CloudflareStreamVideoInfo,
  GetVideoByParentReq,
  InitializeVideoUploadReq,
} from "@repo/contract";
import { eq } from "drizzle-orm";

export const videosRepository = {
  getByParent: async (parent: GetVideoByParentReq) => {
    const parentColumns = {
      course: schema.videos.courseId,
      topic: schema.videos.topicId,
      lesson: schema.videos.lessonId,
    } as const;
    const parentColumn = parentColumns[parent.parentType];

    return await db.query.videos.findFirst({
      where: eq(parentColumn, parent.parentId),
      columns: { createdAt: false, updatedAt: false },
    });
  },

  create: async (data: InitializeVideoUploadReq & { streamUid: string }) => {
    const parent = {
      course: { courseId: data.parentId },
      topic: { topicId: data.parentId },
      lesson: { lessonId: data.parentId },
    } as const;
    const [video] = await db
      .insert(schema.videos)
      .values({ ...parent[data.parentType], name: data.fileName, streamUid: data.streamUid })
      .returning({ id: schema.videos.id });

    return video!;
  },

  markProcessing: async (id: string) => {
    const [video] = await db
      .update(schema.videos)
      .set({
        status: "processing",
        updatedAt: new Date(),
      })
      .where(eq(schema.videos.id, id))
      .returning({ id: schema.videos.id });

    return video;
  },

  deleteById: async (id: string) => {
    const [video] = await db
      .delete(schema.videos)
      .where(eq(schema.videos.id, id))
      .returning({ id: schema.videos.id, streamUid: schema.videos.streamUid });

    return video;
  },

  getById: async (id: string) => {
    return await db.query.videos.findFirst({
      where: eq(schema.videos.id, id),
      columns: { id: true, streamUid: true },
    });
  },

  updateFromWebhook: async (streamUid: string, info: CloudflareStreamVideoInfo) => {
    const state = info.status?.state;
    const status =
      info.readyToStream && state === "ready"
        ? "ready"
        : state === "error"
          ? "error"
          : "processing";
    const errorMessage = info.status?.errorReasonText ?? info.status?.errorReasonCode;

    const [video] = await db
      .update(schema.videos)
      .set({
        info,
        status,
        durationSeconds: info.duration === undefined ? undefined : Math.round(info.duration),
        thumbnailUrl: info.thumbnail,
        errorMessage: status === "error" ? errorMessage : null,
        updatedAt: new Date(),
      })
      .where(eq(schema.videos.streamUid, streamUid))
      .returning({ id: schema.videos.id });

    return video;
  },
};
