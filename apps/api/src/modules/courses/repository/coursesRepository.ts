import { db, schema } from "@repo/db";
import { CourseEntity, UserEntity } from "@repo/db-schema";
import { eq, ilike, or, and, count, asc, desc, notInArray, isNull, inArray } from "drizzle-orm";
import {
  CourseTree,
  CreateCourseDraftInput,
  CreateCourseReq,
  PaginationRes,
  Search,
  UpdateCourseReq,
} from "@repo/contract";
import { CourseGetAllQuerySchema } from "@repo/contract";
import { z } from "zod";

type CourseRow = Omit<CourseEntity, "createdAt" | "updatedAt">;

type CourseCreator = Pick<UserEntity, "id" | "firstName" | "lastName" | "username" | "avatarUrl">;

type CourseWithCreator = CourseRow & { creator: CourseCreator };

type CourseWithCreatorAndStats = CourseWithCreator & { enrolledCount: number };

const courseTreeColumns = {
  id: true,
  publicId: true,
  name: true,
  description: true,
  status: true,
  visibility: true,
} as const;

const courseRowColumns = {
  id: schema.courses.id,
  creatorId: schema.courses.creatorId,
  name: schema.courses.name,
  description: schema.courses.description,
  thumbnailObjectKey: schema.courses.thumbnailObjectKey,
  publicId: schema.courses.publicId,
  status: schema.courses.status,
  visibility: schema.courses.visibility,
  aiAccessEnabled: schema.courses.aiAccessEnabled,
  publishedAt: schema.courses.publishedAt,
  ratingAverage: schema.courses.ratingAverage,
  ratingCount: schema.courses.ratingCount,
};

const treeItemColumns = { id: true, name: true, description: true, position: true } as const;

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

// Adds the number of active (non-withdrawn) enrollments to each course in one grouped query
async function withEnrolledCounts<T extends { id: string }>(
  courses: T[]
): Promise<(T & { enrolledCount: number })[]> {
  const courseIds = courses.map((course) => course.id);
  if (courseIds.length === 0) {
    return [];
  }

  const enrollmentCounts = await db
    .select({ courseId: schema.courseEnrollments.courseId, count: count() })
    .from(schema.courseEnrollments)
    .where(
      and(
        inArray(schema.courseEnrollments.courseId, courseIds),
        isNull(schema.courseEnrollments.withdrawnAt)
      )
    )
    .groupBy(schema.courseEnrollments.courseId);
  const countByCourseId = new Map(enrollmentCounts.map((row) => [row.courseId, row.count]));

  return courses.map((course) => ({
    ...course,
    enrolledCount: countByCourseId.get(course.id) ?? 0,
  }));
}

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
  }: GetAllCoursesParams): Promise<PaginationRes<CourseWithCreatorAndStats>> => {
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
      data: await withEnrolledCounts(data),
      pagination: { total, page, limit: limit || total },
    };
  },

  getCourseById: async (id: string): Promise<CourseRow | undefined> => {
    return await db.query.courses.findFirst({
      where: eq(schema.courses.id, id),
      columns: { createdAt: false, updatedAt: false },
    });
  },

  getCourseByPublicId: async (publicId: string): Promise<CourseRow | undefined> => {
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
  }: GetAllPublishedCoursesParams): Promise<PaginationRes<CourseWithCreatorAndStats>> => {
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
      data: await withEnrolledCounts(data),
      pagination: { total, page, limit: limit || total },
    };
  },

  createCourse: async (data: CreateCourseReq & { creatorId: string }): Promise<CourseRow> => {
    const [course] = await db.insert(schema.courses).values(data).returning(courseRowColumns);
    return course!;
  },

  updateCourse: async (id: string, data: UpdateCourseReq): Promise<CourseRow | undefined> => {
    const [course] = await db
      .update(schema.courses)
      .set(data)
      .where(eq(schema.courses.id, id))
      .returning(courseRowColumns);
    return course;
  },

  setThumbnailObjectKey: async (
    id: string,
    thumbnailObjectKey: string | null
  ): Promise<CourseEntity | undefined> => {
    const [course] = await db
      .update(schema.courses)
      .set({ thumbnailObjectKey })
      .where(eq(schema.courses.id, id))
      .returning();
    return course;
  },

  deleteCourse: async (id: string): Promise<CourseRow | undefined> => {
    const [course] = await db
      .delete(schema.courses)
      .where(eq(schema.courses.id, id))
      .returning(courseRowColumns);
    return course;
  },

  getCourseTree: async (id: string): Promise<CourseTree | undefined> => {
    return await db.query.courses.findFirst({
      where: eq(schema.courses.id, id),
      columns: courseTreeColumns,
      with: {
        topics: {
          columns: treeItemColumns,
          orderBy: [asc(schema.topics.position)],
          with: {
            lessons: { columns: treeItemColumns, orderBy: [asc(schema.lessons.position)] },
          },
        },
      },
    });
  },

  // Inserts course → topics → lessons in one transaction; positions follow array order
  createCourseTree: async ({
    topics = [],
    ...data
  }: CreateCourseDraftInput & { creatorId: string }): Promise<CourseTree> => {
    return await db.transaction(async (tx) => {
      const [course] = await tx
        .insert(schema.courses)
        .values({ ...data, status: "draft" })
        .returning({
          id: schema.courses.id,
          publicId: schema.courses.publicId,
          name: schema.courses.name,
          description: schema.courses.description,
          status: schema.courses.status,
          visibility: schema.courses.visibility,
        });

      if (topics.length === 0) {
        return { ...course!, topics: [] };
      }

      const insertedTopics = await tx
        .insert(schema.topics)
        .values(
          topics.map((topic, position) => ({
            courseId: course!.id,
            name: topic.name,
            description: topic.description,
            position,
          }))
        )
        .returning({
          id: schema.topics.id,
          name: schema.topics.name,
          description: schema.topics.description,
          position: schema.topics.position,
        });
      insertedTopics.sort((a, b) => a.position - b.position);

      const lessonValues = insertedTopics.flatMap((topic) =>
        (topics[topic.position]!.lessons ?? []).map((lesson, position) => ({
          topicId: topic.id,
          name: lesson.name,
          description: lesson.description,
          position,
        }))
      );
      const insertedLessons =
        lessonValues.length > 0
          ? await tx.insert(schema.lessons).values(lessonValues).returning({
              id: schema.lessons.id,
              topicId: schema.lessons.topicId,
              name: schema.lessons.name,
              description: schema.lessons.description,
              position: schema.lessons.position,
            })
          : [];

      return {
        ...course!,
        topics: insertedTopics.map((topic) => ({
          ...topic,
          lessons: insertedLessons
            .filter((lesson) => lesson.topicId === topic.id)
            .sort((a, b) => a.position - b.position)
            .map(({ id, name, description, position }) => ({ id, name, description, position })),
        })),
      };
    });
  },
};
