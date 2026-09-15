import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { courses } from "./courses";
import { documentStatusEnum } from "./enums";
import { lessons } from "./lessons";
import { topics } from "./topics";
import { users } from "./users";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id").references(() => topics.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
    uploadedByUserId: uuid("uploaded_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    objectKey: text("object_key").notNull(),
    originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
    contentType: varchar("content_type", { length: 100 }).notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    status: documentStatusEnum("status").notNull().default("pending"),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    check(
      "documents_exactly_one_parent",
      sql`num_nonnulls(${t.courseId}, ${t.topicId}, ${t.lessonId}) = 1`
    ),
    uniqueIndex("documents_object_key_unique").on(t.objectKey),
    index("documents_course_id_index").on(t.courseId),
    index("documents_topic_id_index").on(t.topicId),
    index("documents_lesson_id_index").on(t.lessonId),
    index("documents_status_index").on(t.status),
  ]
);
