ALTER TABLE "courses" RENAME COLUMN "slug" TO "public_id";--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT "courses_slug_unique";--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_public_id_unique" UNIQUE("public_id");