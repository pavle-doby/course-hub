import { client, db, schema } from "@repo/db";
import { eq, sql } from "drizzle-orm";

const KEEP_MIN = 1;
const KEEP_MAX = 3;

const COMMENTS = [
  "Clear explanations and well-paced lessons.",
  "Good content, though some topics could go deeper.",
  "Really practical, I applied it right away.",
  "Solid course overall.",
  "Great structure, easy to follow.",
  null,
];

const randomInt = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min + 1));

const shuffle = <T>(items: T[]): T[] => [...items].sort(() => Math.random() - 0.5);

async function seedEnrollmentsReviews(): Promise<void> {
  try {
    const users = await db.select({ id: schema.users.id }).from(schema.users);
    const courses = await db
      .select({ id: schema.courses.id, creatorId: schema.courses.creatorId })
      .from(schema.courses)
      .where(eq(schema.courses.status, "published"));

    // Creators don't enroll in (or review) their own courses.
    const pairs = users.flatMap((user) =>
      courses
        .filter((course) => course.creatorId !== user.id)
        .map((course) => ({ userId: user.id, courseId: course.id }))
    );

    if (pairs.length === 0) {
      console.log("No user/course pairs to seed.");
      return;
    }

    const keep = new Set(
      users.flatMap((user) => {
        const own = shuffle(pairs.filter((pair) => pair.userId === user.id));
        return own.slice(0, randomInt(KEEP_MIN, KEEP_MAX)).map((p) => `${p.userId}:${p.courseId}`);
      })
    );

    // ponytail: one multi-row insert per table; chunk if pairs ever exceed Postgres' ~65k param limit.
    await db.transaction(async (tx) => {
      const now = new Date();

      // Enroll everyone, then withdraw all but a few: written directly as the final state.
      const enrollments: Array<typeof schema.courseEnrollments.$inferInsert> = pairs.map(
        (pair) => ({
          ...pair,
          enrolledAt: now,
          withdrawnAt: keep.has(`${pair.userId}:${pair.courseId}`) ? null : now,
        })
      );
      await tx
        .insert(schema.courseEnrollments)
        .values(enrollments)
        .onConflictDoUpdate({
          target: [schema.courseEnrollments.userId, schema.courseEnrollments.courseId],
          set: { enrolledAt: now, completedAt: null, withdrawnAt: sql`excluded.withdrawn_at` },
        });

      const reviews: Array<typeof schema.courseReviews.$inferInsert> = pairs.map((pair) => ({
        ...pair,
        rating: randomInt(3, 5),
        comment: COMMENTS[randomInt(0, COMMENTS.length - 1)],
      }));
      await tx
        .insert(schema.courseReviews)
        .values(reviews)
        .onConflictDoUpdate({
          target: [schema.courseReviews.userId, schema.courseReviews.courseId],
          set: { rating: sql`excluded.rating`, comment: sql`excluded.comment`, updatedAt: now },
        });

      // Same denormalized rating the API keeps in reviewsRepository.saveReview.
      const reviewsOfCourse = sql`from ${schema.courseReviews} r where r.course_id = ${schema.courses.id}`;
      await tx.update(schema.courses).set({
        ratingAverage: sql`coalesce((select avg(r.rating) ${reviewsOfCourse}), 0)`,
        ratingCount: sql`(select count(*) ${reviewsOfCourse})`,
      });
    });

    console.log(`Enrolled ${users.length} user(s) in ${courses.length} published course(s).`);
    console.log(`Saved ${pairs.length} review(s) rated 3-5.`);
    console.log(`Withdrew ${pairs.length - keep.size} enrollment(s); kept ${keep.size} active.`);
  } catch (error) {
    console.error("Failed to seed enrollments and reviews:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

seedEnrollmentsReviews();
