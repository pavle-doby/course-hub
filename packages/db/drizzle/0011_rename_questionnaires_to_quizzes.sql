ALTER TABLE "questionnaires" RENAME TO "quizzes";--> statement-breakpoint
ALTER TABLE "questionnaire_responses" RENAME TO "quiz_responses";--> statement-breakpoint
ALTER TABLE "quiz_responses" RENAME COLUMN "questionnaire_id" TO "quiz_id";--> statement-breakpoint
ALTER TABLE "quiz_responses" DROP CONSTRAINT "questionnaire_responses_user_id_questionnaire_id_unique";--> statement-breakpoint
ALTER TABLE "quizzes" DROP CONSTRAINT "questionnaires_exactly_one_parent";--> statement-breakpoint
ALTER TABLE "quizzes" DROP CONSTRAINT "questionnaires_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "quizzes" DROP CONSTRAINT "questionnaires_topic_id_topics_id_fk";
--> statement-breakpoint
ALTER TABLE "quizzes" DROP CONSTRAINT "questionnaires_lesson_id_lessons_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_responses" DROP CONSTRAINT "questionnaire_responses_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_responses" DROP CONSTRAINT "questionnaire_responses_questionnaire_id_questionnaires_id_fk";
--> statement-breakpoint
DROP INDEX "questionnaires_course_id_unique";--> statement-breakpoint
DROP INDEX "questionnaires_topic_id_unique";--> statement-breakpoint
DROP INDEX "questionnaires_lesson_id_unique";--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_responses" ADD CONSTRAINT "quiz_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_responses" ADD CONSTRAINT "quiz_responses_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "quizzes_course_id_unique" ON "quizzes" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "quizzes_topic_id_unique" ON "quizzes" USING btree ("topic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "quizzes_lesson_id_unique" ON "quizzes" USING btree ("lesson_id");--> statement-breakpoint
ALTER TABLE "quiz_responses" ADD CONSTRAINT "quiz_responses_user_id_quiz_id_unique" UNIQUE("user_id","quiz_id");--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_exactly_one_parent" CHECK (num_nonnulls("quizzes"."course_id", "quizzes"."topic_id", "quizzes"."lesson_id") = 1);