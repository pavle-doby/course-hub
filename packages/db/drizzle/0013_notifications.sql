CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "notification_category" NOT NULL,
	"course_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"url" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_user_id_read_at_index" ON "notifications" USING btree ("user_id","read_at");