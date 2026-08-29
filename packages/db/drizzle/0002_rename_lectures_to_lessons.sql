ALTER TABLE "lectures" RENAME TO "lessons";--> statement-breakpoint
ALTER TABLE "lecture_progress" RENAME TO "lesson_progress";--> statement-breakpoint
ALTER TABLE "videos" RENAME COLUMN "lecture_id" TO "lesson_id";--> statement-breakpoint
ALTER TABLE "course_progress" RENAME COLUMN "current_lecture_id" TO "current_lesson_id";--> statement-breakpoint
ALTER TABLE "lesson_progress" RENAME COLUMN "lecture_id" TO "lesson_id";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_lecture_id_unique";--> statement-breakpoint
ALTER TABLE "lesson_progress" DROP CONSTRAINT "lecture_progress_user_id_lecture_id_unique";--> statement-breakpoint
ALTER TABLE "lessons" DROP CONSTRAINT "lectures_topic_id_topics_id_fk";
--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_lecture_id_lectures_id_fk";
--> statement-breakpoint
ALTER TABLE "course_progress" DROP CONSTRAINT "course_progress_current_lecture_id_lectures_id_fk";
--> statement-breakpoint
ALTER TABLE "lesson_progress" DROP CONSTRAINT "lecture_progress_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "lesson_progress" DROP CONSTRAINT "lecture_progress_lecture_id_lectures_id_fk";
--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_current_lesson_id_lessons_id_fk" FOREIGN KEY ("current_lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_lesson_id_unique" UNIQUE("lesson_id");--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_lesson_id_unique" UNIQUE("user_id","lesson_id");