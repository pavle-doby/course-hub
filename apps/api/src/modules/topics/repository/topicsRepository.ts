import { db, schema } from "@repo/db";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import {
  CreateTopicReq,
  GetAllTopicsRes,
  GetTopicRes,
  Topic,
  UpdateTopicReq,
} from "@repo/contract";

type GetAllTopicsParams = {
  offset?: number;
  limit?: number;
  page: number;
  creatorId: string;
  query?: string;
  courseId?: string;
};

const topicColumns = {
  id: schema.topics.id,
  courseId: schema.topics.courseId,
  name: schema.topics.name,
  description: schema.topics.description,
  position: schema.topics.position,
};

export const topicsRepository = {
  getAllTopics: async ({
    offset,
    limit,
    page,
    creatorId,
    query,
    courseId,
  }: GetAllTopicsParams): Promise<GetAllTopicsRes> => {
    const conditions = [
      eq(schema.courses.creatorId, creatorId),
      query
        ? or(
            ilike(schema.topics.name, `%${query}%`),
            ilike(schema.topics.description, `%${query}%`)
          )
        : undefined,
      courseId ? eq(schema.topics.courseId, courseId) : undefined,
    ].filter(Boolean);
    const whereClause = and(...conditions);

    const countResult = await db
      .select({ count: count() })
      .from(schema.topics)
      .innerJoin(schema.courses, eq(schema.topics.courseId, schema.courses.id))
      .where(whereClause);
    const total = countResult[0]?.count ?? 0;

    const data = await db
      .select(topicColumns)
      .from(schema.topics)
      .innerJoin(schema.courses, eq(schema.topics.courseId, schema.courses.id))
      .where(whereClause)
      .orderBy(desc(schema.courses.createdAt), asc(schema.topics.position))
      .offset(offset ?? 0)
      .limit(limit ?? total);

    return { data, pagination: { total, page, limit: limit || total } };
  },

  getTopicById: async (id: string): Promise<GetTopicRes> => {
    return await db.query.topics.findFirst({
      where: eq(schema.topics.id, id),
      columns: { createdAt: false, updatedAt: false },
    });
  },

  createTopic: async (data: CreateTopicReq): Promise<Topic> => {
    const [topic] = await db.insert(schema.topics).values(data).returning(topicColumns);
    return topic!;
  },

  updateTopic: async (id: string, data: UpdateTopicReq): Promise<Topic | undefined> => {
    const [topic] = await db
      .update(schema.topics)
      .set(data)
      .where(eq(schema.topics.id, id))
      .returning(topicColumns);
    return topic;
  },

  deleteTopic: async (id: string): Promise<Topic | undefined> => {
    const [topic] = await db
      .delete(schema.topics)
      .where(eq(schema.topics.id, id))
      .returning(topicColumns);
    return topic;
  },
};
