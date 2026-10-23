import { pgTable, uuid, date, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { courses } from "./courses";

// One row per learner per course per (UTC) day with any progress or quiz save; drives the
// leaderboard's consistency points.
export const learnerActivityDays = pgTable(
  "learner_activity_days",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
  },
  (t) => [unique().on(t.userId, t.courseId, t.day)]
);
