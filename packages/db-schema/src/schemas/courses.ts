import { randomBytes } from "node:crypto";
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  real,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { courseStatusEnum, courseVisibilityEnum } from "./enums";
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
  thumbnailObjectKey: text("thumbnail_object_key"),
  status: courseStatusEnum("status").notNull().default("draft"),
  visibility: courseVisibilityEnum("visibility").notNull().default("private"),
  // Creator opt-in: enrolled students may pull this course into their AI agent (MCP).
  aiAccessEnabled: boolean("ai_access_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  // Denormalized from course_reviews; recomputed whenever a review is saved.
  ratingAverage: real("rating_average").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
});
