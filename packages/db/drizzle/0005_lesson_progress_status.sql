CREATE TYPE "public"."lesson_progress_status" AS ENUM('todo', 'in_progress', 'done');--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "theme" SET DEFAULT 'dark';--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN "status" "lesson_progress_status" DEFAULT 'todo' NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_progress" DROP COLUMN "completed";