import { pgEnum } from "drizzle-orm/pg-core";

// User role enum
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

// User status enum
export const userStatusEnum = pgEnum("user_status", [
  "pending",
  "approved",
  "rejected",
]);
