import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { contentBehaviorEnum, themeEnum } from "./enums";
import { users } from "./users";

export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  contentBehavior: contentBehaviorEnum("content_behavior").notNull().default("both"),
  theme: themeEnum("theme").notNull().default("system"),
  language: varchar("language", { length: 10 }).notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
