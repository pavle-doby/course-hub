import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["pending", "approved", "rejected"]);
export const contentBehaviorEnum = pgEnum("content_behavior", ["create", "consume", "both"]);
export const themeEnum = pgEnum("theme", ["light", "dark", "system"]);
export const courseStatusEnum = pgEnum("course_status", ["draft", "published", "archived"]);
