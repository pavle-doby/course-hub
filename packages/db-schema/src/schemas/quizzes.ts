import { sql } from "drizzle-orm";
import { check, jsonb, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { courses } from "./courses";
import { lessons } from "./lessons";
import { topics } from "./topics";

export type QuizChoice = { value: string; label: string; correct: boolean };

type QuizQuestionBase = {
  id: string;
  prompt: string;
  description?: string;
  required: boolean;
};

export type QuizQuestion =
  | (QuizQuestionBase & { type: "single" | "multiple"; choices: QuizChoice[] })
  | (QuizQuestionBase & { type: "text" });

// One quiz per course, topic or lesson. Questions are stored whole as jsonb (validated by Zod in
// @repo/contract). ponytail: split into questions/choices tables only if per-question queries are needed.
export const quizzes = pgTable(
  "quizzes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id").references(() => topics.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
    questions: jsonb("questions").$type<QuizQuestion[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    check(
      "quizzes_exactly_one_parent",
      sql`num_nonnulls(${t.courseId}, ${t.topicId}, ${t.lessonId}) = 1`
    ),
    uniqueIndex("quizzes_course_id_unique").on(t.courseId),
    uniqueIndex("quizzes_topic_id_unique").on(t.topicId),
    uniqueIndex("quizzes_lesson_id_unique").on(t.lessonId),
  ]
);
