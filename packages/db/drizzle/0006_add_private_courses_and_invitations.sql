CREATE TYPE "public"."course_invitation_status" AS ENUM('pending', 'accepted', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."course_invitation_type" AS ENUM('email', 'link');--> statement-breakpoint
CREATE TYPE "public"."course_visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "course_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"invited_by" uuid NOT NULL,
	"token" varchar(64) NOT NULL,
	"type" "course_invitation_type" NOT NULL,
	"email" varchar(255),
	"status" "course_invitation_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	"accepted_by_user_id" uuid,
	CONSTRAINT "course_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "visibility" "course_visibility" DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "course_invitations" ADD CONSTRAINT "course_invitations_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_invitations" ADD CONSTRAINT "course_invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_invitations" ADD CONSTRAINT "course_invitations_accepted_by_user_id_users_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;