import { db, schema } from "@repo/db";
import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { CourseEnrollment, GetAllEnrolledCoursesRes, GetAllStudentsRes } from "@repo/contract";

type GetEnrolledCoursesParams = {
  userId: string;
  offset?: number;
  limit?: number;
  page: number;
  query?: string;
};

type GetStudentsParams = {
  creatorId: string;
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

const studentColumns = {
  id: schema.users.id,
  firstName: schema.users.firstName,
  lastName: schema.users.lastName,
  username: schema.users.username,
  avatarUrl: schema.users.avatarUrl,
  email: schema.users.email,
};

const enrolledCourseColumns = {
  id: schema.courses.id,
  name: schema.courses.name,
  publicId: schema.courses.publicId,
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

  // Re-enrolling reuses the existing row (unique on userId+courseId) instead of inserting a new one.
  reactivateEnrollment: async (id: string): Promise<CourseEnrollment> => {
    const [enrollment] = await db
      .update(schema.courseEnrollments)
      .set({ enrolledAt: new Date(), completedAt: null, withdrawnAt: null })
      .where(eq(schema.courseEnrollments.id, id))
      .returning();
    return enrollment!;
  },

  withdrawEnrollment: async (
    userId: string,
    courseId: string
  ): Promise<CourseEnrollment | undefined> => {
    const [enrollment] = await db
      .update(schema.courseEnrollments)
      .set({ withdrawnAt: new Date() })
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
    const whereClause = and(
      eq(schema.courseEnrollments.userId, userId),
      isNull(schema.courseEnrollments.withdrawnAt),
      searchCondition
    );

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

  getStudents: async ({
    creatorId,
    offset,
    limit,
    page,
    query,
  }: GetStudentsParams): Promise<GetAllStudentsRes> => {
    const searchCondition = query
      ? or(
          ilike(schema.courses.name, `%${query}%`),
          ilike(schema.users.firstName, `%${query}%`),
          ilike(schema.users.lastName, `%${query}%`),
          ilike(schema.users.username, `%${query}%`)
        )
      : undefined;
    const whereClause = and(eq(schema.courses.creatorId, creatorId), searchCondition);

    const countResult = await db
      .select({ count: count() })
      .from(schema.courseEnrollments)
      .innerJoin(schema.courses, eq(schema.courseEnrollments.courseId, schema.courses.id))
      .innerJoin(schema.users, eq(schema.courseEnrollments.userId, schema.users.id))
      .where(whereClause);
    const total = countResult[0]?.count ?? 0;

    const rows = await db
      .select({
        student: studentColumns,
        course: enrolledCourseColumns,
        enrolledAt: schema.courseEnrollments.enrolledAt,
        completedAt: schema.courseEnrollments.completedAt,
        withdrawnAt: schema.courseEnrollments.withdrawnAt,
      })
      .from(schema.courseEnrollments)
      .innerJoin(schema.courses, eq(schema.courseEnrollments.courseId, schema.courses.id))
      .innerJoin(schema.users, eq(schema.courseEnrollments.userId, schema.users.id))
      .where(whereClause)
      .orderBy(desc(schema.courseEnrollments.enrolledAt))
      .offset(offset ?? 0)
      .limit(limit ?? total);

    return {
      data: rows.map((row) => ({
        ...row.student,
        course: row.course,
        enrolledAt: row.enrolledAt,
        completedAt: row.completedAt,
        withdrawnAt: row.withdrawnAt,
      })),
      pagination: { total, page, limit: limit || total },
    };
  },
};
