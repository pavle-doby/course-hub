CREATE TYPE "public"."document_status" AS ENUM('pending', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid,
	"topic_id" uuid,
	"lesson_id" uuid,
	"uploaded_by_user_id" uuid NOT NULL,
	"object_key" text NOT NULL,
	"original_file_name" varchar(255) NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"size_bytes" integer NOT NULL,
	"status" "document_status" DEFAULT 'pending' NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "documents_exactly_one_parent" CHECK (num_nonnulls("documents"."course_id", "documents"."topic_id", "documents"."lesson_id") = 1)
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "documents_object_key_unique" ON "documents" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "documents_course_id_index" ON "documents" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "documents_topic_id_index" ON "documents" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "documents_lesson_id_index" ON "documents" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "documents_status_index" ON "documents" USING btree ("status");