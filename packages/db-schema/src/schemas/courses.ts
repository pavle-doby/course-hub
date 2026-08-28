import { randomBytes } from "node:crypto";
import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { courseStatusEnum } from "./enums";
import { users } from "./users";

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 255 }).notNull(),
  publicId: varchar("public_id", { length: 12 })
    .notNull()
    .unique()
    .$defaultFn(() => randomBytes(6).toString("hex")),
  description: text("description"),
  status: courseStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
});
