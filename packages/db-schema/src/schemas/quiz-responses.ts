import { jsonb, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { quizzes } from "./quizzes";
import { users } from "./users";

/** Question id → chosen value (single / text) or values (multiple). */
export type QuizAnswers = Record<string, string | string[]>;

// One saved response per learner per quiz; clearing answers deletes the row.
// Only answers are stored: the score is recomputed against the current questions on read.
export const quizResponses = pgTable(
  "quiz_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    quizId: uuid("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    answers: jsonb("answers").$type<QuizAnswers>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.quizId)]
);
