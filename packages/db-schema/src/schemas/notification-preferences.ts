import { pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { notificationCategoryEnum } from "./enums";
import { users } from "./users";
import { courses } from "./courses";

export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // null = all courses the user has the matching relationship with (set from Settings)
    courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }),
    category: notificationCategoryEnum("category").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique().on(table.userId, table.courseId, table.category).nullsNotDistinct()]
);
