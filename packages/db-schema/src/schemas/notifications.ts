import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { notificationCategoryEnum } from "./enums";
import { users } from "./users";
import { courses } from "./courses";

// ponytail: no retention/pruning of old history rows yet; add when volume matters.
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: notificationCategoryEnum("category").notNull(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    url: text("url").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index().on(table.userId, table.readAt)]
);
