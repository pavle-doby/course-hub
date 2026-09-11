import { randomBytes } from "node:crypto";
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { courseInvitationTypeEnum, courseInvitationStatusEnum } from "./enums";
import { users } from "./users";
import { courses } from "./courses";

export const courseInvitations = pgTable("course_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  invitedBy: uuid("invited_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 })
    .notNull()
    .unique()
    .$defaultFn(() => randomBytes(24).toString("hex")),
  type: courseInvitationTypeEnum("type").notNull(),
  email: varchar("email", { length: 255 }),
  status: courseInvitationStatusEnum("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  acceptedByUserId: uuid("accepted_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
});
