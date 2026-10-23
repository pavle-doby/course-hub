import { db, schema } from "@repo/db";
import { eq } from "drizzle-orm";

export type CourseLearnerRow = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  avatarUrl: string | null;
  email: string;
  withdrawnAt: Date | null;
};

export const leaderboardRepository = {
  // Everyone who ever enrolled, withdrawn learners included.
  getCourseLearners: async (courseId: string): Promise<CourseLearnerRow[]> => {
    return await db
      .select({
        userId: schema.users.id,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        username: schema.users.username,
        avatarUrl: schema.users.avatarUrl,
        email: schema.users.email,
        withdrawnAt: schema.courseEnrollments.withdrawnAt,
      })
      .from(schema.courseEnrollments)
      .innerJoin(schema.users, eq(schema.courseEnrollments.userId, schema.users.id))
      .where(eq(schema.courseEnrollments.courseId, courseId));
  },

  getActivityDays: async (courseId: string): Promise<{ userId: string; day: string }[]> => {
    return await db
      .select({
        userId: schema.learnerActivityDays.userId,
        day: schema.learnerActivityDays.day,
      })
      .from(schema.learnerActivityDays)
      .where(eq(schema.learnerActivityDays.courseId, courseId));
  },
};
