import { db, schema } from "@repo/db";
import { avg, count, desc, eq, and } from "drizzle-orm";
import { CourseReview, GetCourseReviewsRes, SaveCourseReviewReq } from "@repo/contract";

const reviewColumns = {
  id: schema.courseReviews.id,
  rating: schema.courseReviews.rating,
  comment: schema.courseReviews.comment,
  reply: schema.courseReviews.reply,
  repliedAt: schema.courseReviews.repliedAt,
  createdAt: schema.courseReviews.createdAt,
  updatedAt: schema.courseReviews.updatedAt,
  author: {
    id: schema.users.id,
    firstName: schema.users.firstName,
    lastName: schema.users.lastName,
    username: schema.users.username,
    avatarUrl: schema.users.avatarUrl,
  },
};

type GetCourseReviewsParams = {
  courseId: string;
  offset?: number;
  limit?: number;
  page: number;
};

export const reviewsRepository = {
  getReview: async (userId: string, courseId: string): Promise<CourseReview | undefined> => {
    const [review] = await db
      .select(reviewColumns)
      .from(schema.courseReviews)
      .innerJoin(schema.users, eq(schema.courseReviews.userId, schema.users.id))
      .where(
        and(eq(schema.courseReviews.userId, userId), eq(schema.courseReviews.courseId, courseId))
      )
      .limit(1);
    return review;
  },

  getReviewById: async (reviewId: string): Promise<CourseReview | undefined> => {
    const [review] = await db
      .select(reviewColumns)
      .from(schema.courseReviews)
      .innerJoin(schema.users, eq(schema.courseReviews.userId, schema.users.id))
      .where(eq(schema.courseReviews.id, reviewId))
      .limit(1);
    return review;
  },

  getReviewCourseCreatorId: async (reviewId: string): Promise<string | undefined> => {
    const [row] = await db
      .select({ creatorId: schema.courses.creatorId })
      .from(schema.courseReviews)
      .innerJoin(schema.courses, eq(schema.courseReviews.courseId, schema.courses.id))
      .where(eq(schema.courseReviews.id, reviewId))
      .limit(1);
    return row?.creatorId;
  },

  saveReply: async (reviewId: string, reply: string | null): Promise<void> => {
    await db
      .update(schema.courseReviews)
      .set({ reply, repliedAt: reply ? new Date() : null })
      .where(eq(schema.courseReviews.id, reviewId));
  },

  getCourseReviews: async ({
    courseId,
    offset,
    limit,
    page,
  }: GetCourseReviewsParams): Promise<GetCourseReviewsRes> => {
    const whereClause = eq(schema.courseReviews.courseId, courseId);
    const [totals] = await db
      .select({ count: count() })
      .from(schema.courseReviews)
      .where(whereClause);
    const total = totals?.count ?? 0;

    const data = await db
      .select(reviewColumns)
      .from(schema.courseReviews)
      .innerJoin(schema.users, eq(schema.courseReviews.userId, schema.users.id))
      .where(whereClause)
      .orderBy(desc(schema.courseReviews.updatedAt))
      .offset(offset ?? 0)
      .limit(limit ?? total);

    return { data, pagination: { total, page, limit: limit || total } };
  },

  // Upserts the review and recomputes the course's denormalized rating in one transaction.
  saveReview: async (
    userId: string,
    courseId: string,
    { rating, comment }: SaveCourseReviewReq
  ): Promise<void> => {
    await db.transaction(async (tx) => {
      const now = new Date();
      const fields = { rating, comment: comment || null };
      await tx
        .insert(schema.courseReviews)
        .values({ userId, courseId, ...fields })
        .onConflictDoUpdate({
          target: [schema.courseReviews.userId, schema.courseReviews.courseId],
          set: { ...fields, updatedAt: now },
        });

      const [totals] = await tx
        .select({ average: avg(schema.courseReviews.rating), count: count() })
        .from(schema.courseReviews)
        .where(eq(schema.courseReviews.courseId, courseId));

      await tx
        .update(schema.courses)
        .set({ ratingAverage: Number(totals?.average ?? 0), ratingCount: totals?.count ?? 0 })
        .where(eq(schema.courses.id, courseId));
    });
  },
};
