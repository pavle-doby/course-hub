import { sql } from "drizzle-orm";
import { pgTable, uuid, smallint, text, timestamp, unique, check } from "drizzle-orm/pg-core";
import { users } from "./users";
import { courses } from "./courses";

// One review per learner per course; the course creator can leave one reply on it.
export const courseReviews = pgTable(
  "course_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    rating: smallint("rating").notNull(),
    comment: text("comment"),
    reply: text("reply"),
    repliedAt: timestamp("replied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    unique().on(t.userId, t.courseId),
    check("course_reviews_rating_range", sql`${t.rating} between 1 and 5`),
  ]
);
