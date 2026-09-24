CREATE TYPE "public"."api_token_source" AS ENUM('manual', 'oauth');--> statement-breakpoint
ALTER TABLE "api_tokens" ADD COLUMN "source" "api_token_source" DEFAULT 'manual' NOT NULL;