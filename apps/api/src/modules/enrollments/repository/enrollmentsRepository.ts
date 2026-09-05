import { db, schema } from "@repo/db";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { CourseEnrollment, GetAllEnrolledCoursesRes } from "@repo/contract";

type GetEnrolledCoursesParams = {
  userId: string;
  offset?: number;
  limit?: number;
  page: number;
  query?: string;
};

const courseColumns = {
  id: schema.courses.id,
  creatorId: schema.courses.creatorId,
  name: schema.courses.name,
  description: schema.courses.description,
  publicId: schema.courses.publicId,
  status: schema.courses.status,
  publishedAt: schema.courses.publishedAt,
};

const creatorColumns = {
  id: schema.users.id,
  firstName: schema.users.firstName,
  lastName: schema.users.lastName,
  username: schema.users.username,
  avatarUrl: schema.users.avatarUrl,
};

export const enrollmentsRepository = {
  getEnrollment: async (
    userId: string,
    courseId: string
  ): Promise<CourseEnrollment | undefined> => {
    return await db.query.courseEnrollments.findFirst({
      where: and(
        eq(schema.courseEnrollments.userId, userId),
        eq(schema.courseEnrollments.courseId, courseId)
      ),
    });
  },

  createEnrollment: async (userId: string, courseId: string): Promise<CourseEnrollment> => {
    const [enrollment] = await db
      .insert(schema.courseEnrollments)
      .values({ userId, courseId })
      .returning();
    return enrollment!;
  },

  deleteEnrollment: async (
    userId: string,
    courseId: string
  ): Promise<CourseEnrollment | undefined> => {
    const [enrollment] = await db
      .delete(schema.courseEnrollments)
      .where(
        and(
          eq(schema.courseEnrollments.userId, userId),
          eq(schema.courseEnrollments.courseId, courseId)
        )
      )
      .returning();
    return enrollment;
  },

  getEnrolledCourses: async ({
    userId,
    offset,
    limit,
    page,
    query,
  }: GetEnrolledCoursesParams): Promise<GetAllEnrolledCoursesRes> => {
    const searchCondition = query
      ? or(
          ilike(schema.courses.name, `%${query}%`),
          ilike(schema.courses.description, `%${query}%`)
        )
      : undefined;
    const whereClause = and(eq(schema.courseEnrollments.userId, userId), searchCondition);

    const countResult = await db
      .select({ count: count() })
      .from(schema.courseEnrollments)
      .innerJoin(schema.courses, eq(schema.courseEnrollments.courseId, schema.courses.id))
      .where(whereClause);
    const total = countResult[0]?.count ?? 0;

    const rows = await db
      .select({ course: courseColumns, creator: creatorColumns })
      .from(schema.courseEnrollments)
      .innerJoin(schema.courses, eq(schema.courseEnrollments.courseId, schema.courses.id))
      .leftJoin(schema.users, eq(schema.courses.creatorId, schema.users.id))
      .where(whereClause)
      .orderBy(desc(schema.courseEnrollments.enrolledAt))
      .offset(offset ?? 0)
      .limit(limit ?? total);

    return {
      data: rows.map((row) => ({ ...row.course, creator: row.creator ?? undefined })),
      pagination: { total, page, limit: limit || total },
    };
  },
};
