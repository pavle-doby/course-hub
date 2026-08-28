import { db, schema } from "@repo/db";
import { eq, ilike, or, and, count, desc } from "drizzle-orm";
import {
  Course,
  CreateCourseReq,
  GetAllCoursesRes,
  GetCourseRes,
  Search,
  UpdateCourseReq,
} from "@repo/contract";
import { CourseGetAllQuerySchema } from "@repo/contract";
import { z } from "zod";

type GetAllCoursesParams = {
  offset?: number;
  limit?: number;
  page: number;
  creatorId: string;
} & Partial<Search> &
  z.infer<typeof CourseGetAllQuerySchema>;

export const coursesRepository = {
  getAllCourses: async ({
    offset,
    limit,
    page,
    creatorId,
    query,
    status,
  }: GetAllCoursesParams): Promise<GetAllCoursesRes> => {
    const searchCondition = query
      ? or(
          ilike(schema.courses.name, `%${query}%`),
          ilike(schema.courses.description, `%${query}%`)
        )
      : undefined;
    const statusCondition = status ? eq(schema.courses.status, status) : undefined;
    const creatorCondition = eq(schema.courses.creatorId, creatorId);

    const conditions = [creatorCondition, searchCondition, statusCondition].filter(Boolean);
    const whereClause = and(...conditions);

    const countResult = await db.select({ count: count() }).from(schema.courses).where(whereClause);
    const total = countResult[0]?.count ?? 0;

    const data = await db.query.courses.findMany({
      where: whereClause,
      offset,
      limit,
      orderBy: [desc(schema.courses.createdAt)],
      columns: { createdAt: false, updatedAt: false },
    });

    return {
      data,
      pagination: { total, page, limit: limit || total },
    };
  },

  getCourseById: async (id: string): Promise<GetCourseRes> => {
    return await db.query.courses.findFirst({
      where: eq(schema.courses.id, id),
      columns: { createdAt: false, updatedAt: false },
    });
  },

  getCourseBySlug: async (slug: string): Promise<Course | undefined> => {
    return await db.query.courses.findFirst({
      where: eq(schema.courses.slug, slug),
      columns: { createdAt: false, updatedAt: false },
    });
  },

  createCourse: async (data: CreateCourseReq & { creatorId: string }): Promise<Course> => {
    const [course] = await db.insert(schema.courses).values(data).returning({
      id: schema.courses.id,
      creatorId: schema.courses.creatorId,
      name: schema.courses.name,
      description: schema.courses.description,
      slug: schema.courses.slug,
      status: schema.courses.status,
      publishedAt: schema.courses.publishedAt,
    });
    return course!;
  },

  updateCourse: async (id: string, data: UpdateCourseReq): Promise<Course | undefined> => {
    const [course] = await db
      .update(schema.courses)
      .set(data)
      .where(eq(schema.courses.id, id))
      .returning({
        id: schema.courses.id,
        creatorId: schema.courses.creatorId,
        name: schema.courses.name,
        description: schema.courses.description,
        slug: schema.courses.slug,
        status: schema.courses.status,
        publishedAt: schema.courses.publishedAt,
      });
    return course;
  },

  deleteCourse: async (id: string): Promise<Course | undefined> => {
    const [course] = await db.delete(schema.courses).where(eq(schema.courses.id, id)).returning({
      id: schema.courses.id,
      creatorId: schema.courses.creatorId,
      name: schema.courses.name,
      description: schema.courses.description,
      slug: schema.courses.slug,
      status: schema.courses.status,
      publishedAt: schema.courses.publishedAt,
    });
    return course;
  },
};
