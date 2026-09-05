import { db, schema } from "@repo/db";
import { eq, ilike, or, and, count, desc, notInArray, isNull } from "drizzle-orm";
import {
  Course,
  CreateCourseReq,
  GetAllCoursesRes,
  GetAllPublicCoursesRes,
  GetCourseRes,
  Search,
  UpdateCourseReq,
} from "@repo/contract";
import { CourseGetAllQuerySchema } from "@repo/contract";
import { z } from "zod";

type GetAllPublishedCoursesParams = {
  offset?: number;
  limit?: number;
  page: number;
} & Partial<Search>;

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
    excludeEnrolled,
    showAllCreators,
  }: GetAllCoursesParams): Promise<GetAllCoursesRes> => {
    const searchCondition = query
      ? or(
          ilike(schema.courses.name, `%${query}%`),
          ilike(schema.courses.description, `%${query}%`)
        )
      : undefined;
    const statusCondition = status ? eq(schema.courses.status, status) : undefined;
    const creatorCondition = showAllCreators ? undefined : eq(schema.courses.creatorId, creatorId);
    const excludeEnrolledCondition = excludeEnrolled
      ? notInArray(
          schema.courses.id,
          db
            .select({ courseId: schema.courseEnrollments.courseId })
            .from(schema.courseEnrollments)
            .where(
              and(
                eq(schema.courseEnrollments.userId, creatorId),
                isNull(schema.courseEnrollments.withdrawnAt)
              )
            )
        )
      : undefined;

    const conditions = [
      creatorCondition,
      searchCondition,
      statusCondition,
      excludeEnrolledCondition,
    ].filter(Boolean);
    const whereClause = and(...conditions);

    const countResult = await db.select({ count: count() }).from(schema.courses).where(whereClause);
    const total = countResult[0]?.count ?? 0;

    const data = await db.query.courses.findMany({
      where: whereClause,
      offset,
      limit,
      orderBy: [desc(schema.courses.createdAt)],
      columns: { createdAt: false, updatedAt: false },
      with: {
        creator: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
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

  getCourseByPublicId: async (publicId: string): Promise<Course | undefined> => {
    return await db.query.courses.findFirst({
      where: eq(schema.courses.publicId, publicId),
      columns: { createdAt: false, updatedAt: false },
    });
  },

  getAllPublishedCourses: async ({
    offset,
    limit,
    page,
    query,
  }: GetAllPublishedCoursesParams): Promise<GetAllPublicCoursesRes> => {
    const searchCondition = query
      ? or(
          ilike(schema.courses.name, `%${query}%`),
          ilike(schema.courses.description, `%${query}%`)
        )
      : undefined;
    const statusCondition = eq(schema.courses.status, "published");

    const whereClause = and(statusCondition, searchCondition);

    const countResult = await db.select({ count: count() }).from(schema.courses).where(whereClause);
    const total = countResult[0]?.count ?? 0;

    const data = await db.query.courses.findMany({
      where: whereClause,
      offset,
      limit,
      orderBy: [desc(schema.courses.createdAt)],
      columns: { createdAt: false, updatedAt: false },
      with: {
        creator: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      data,
      pagination: { total, page, limit: limit || total },
    };
  },

  createCourse: async (data: CreateCourseReq & { creatorId: string }): Promise<Course> => {
    const [course] = await db.insert(schema.courses).values(data).returning({
      id: schema.courses.id,
      creatorId: schema.courses.creatorId,
      name: schema.courses.name,
      description: schema.courses.description,
      publicId: schema.courses.publicId,
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
        publicId: schema.courses.publicId,
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
      publicId: schema.courses.publicId,
      status: schema.courses.status,
      publishedAt: schema.courses.publishedAt,
    });
    return course;
  },
};
