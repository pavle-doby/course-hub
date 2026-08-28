import { client, db, schema } from "@repo/db";
import { eq, inArray } from "drizzle-orm";

// --- Configure target user ---
const TARGET_USER_EMAIL = "iampavle.test+3@gmail.com";

async function cleanCourseContent() {
  try {
    const [user] = await db
      .select({ id: schema.users.id, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.email, TARGET_USER_EMAIL))
      .limit(1);

    if (!user) {
      throw new Error(`User not found: ${TARGET_USER_EMAIL}`);
    }

    console.log(`Cleaning course content for user: ${user.email} (${user.id})\n`);

    // Fetch all courses owned by the user
    const courses = await db
      .select({ id: schema.courses.id, name: schema.courses.name })
      .from(schema.courses)
      .where(eq(schema.courses.creatorId, user.id));

    if (courses.length === 0) {
      console.log("No courses found for this user.");
      return;
    }

    const courseIds = courses.map((c) => c.id);

    // Topics and lectures cascade-delete automatically via FK onDelete: cascade,
    // but we count them first for informative output.
    const topics = await db
      .select({ id: schema.topics.id })
      .from(schema.topics)
      .where(inArray(schema.topics.courseId, courseIds));

    const topicIds = topics.map((t) => t.id);

    const lectureCount =
      topicIds.length > 0
        ? (
            await db
              .select({ id: schema.lectures.id })
              .from(schema.lectures)
              .where(inArray(schema.lectures.topicId, topicIds))
          ).length
        : 0;

    const deleted = await db
      .delete(schema.courses)
      .where(inArray(schema.courses.id, courseIds))
      .returning({ id: schema.courses.id, name: schema.courses.name });

    console.log(
      `Deleted ${deleted.length} course(s), ${topics.length} topic(s), ${lectureCount} lecture(s).`
    );
    console.table(deleted);
  } catch (error) {
    console.error("Failed to clean course content:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

cleanCourseContent();
