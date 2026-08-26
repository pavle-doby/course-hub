import { pgTable, uuid, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";
import { lectures } from "./lectures";

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  lectureId: uuid("lecture_id")
    .notNull()
    .unique()
    .references(() => lectures.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  storagePath: text("storage_path").notNull(),
  durationSeconds: integer("duration_seconds"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
