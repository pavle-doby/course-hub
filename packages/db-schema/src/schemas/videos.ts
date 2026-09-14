import { sql } from "drizzle-orm";
import type { Video as CloudflareStreamVideoInfo } from "cloudflare/resources/stream/stream";
import {
  check,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { courses } from "./courses";
import { topics } from "./topics";
import { lessons } from "./lessons";
import { videoStatusEnum } from "./enums";

export type { CloudflareStreamVideoInfo };

export const videos = pgTable(
  "videos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id").references(() => topics.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    streamUid: text("stream_uid").notNull(),
    status: videoStatusEnum("status").notNull().default("uploading"),
    durationSeconds: integer("duration_seconds"),
    thumbnailUrl: text("thumbnail_url"),
    errorMessage: text("error_message"),
    info: jsonb("info").$type<CloudflareStreamVideoInfo>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    unique().on(t.courseId),
    unique().on(t.topicId),
    unique().on(t.lessonId),
    check(
      "videos_exactly_one_parent",
      sql`num_nonnulls(${t.courseId}, ${t.topicId}, ${t.lessonId}) = 1`
    ),
  ]
);
