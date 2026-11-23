import { pgTable, varchar, text, uuid, timestamp, integer } from "drizzle-orm/pg-core";
import { planEnum, userRoleEnum } from "./enums";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  authUserId: uuid("auth_user_id").notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  username: varchar("username", { length: 255 }).notNull().unique(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  role: userRoleEnum("role").notNull().default("user"),
  plan: planEnum("plan").notNull().default("free"),
  // Which version of the plan's limits the user is on; existing users keep theirs when limits change
  planVersion: integer("plan_version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
