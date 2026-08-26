import { pgTable, uuid, integer, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { lectures } from "./lectures";

export const lectureProgress = pgTable(
  "lecture_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lectureId: uuid("lecture_id")
      .notNull()
      .references(() => lectures.id, { onDelete: "cascade" }),
    progressSeconds: integer("progress_seconds").notNull().default(0),
    completed: boolean("completed").notNull().default(false),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    lastWatchedAt: timestamp("last_watched_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [unique().on(t.userId, t.lectureId)]
);
