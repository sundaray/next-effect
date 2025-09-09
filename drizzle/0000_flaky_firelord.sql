--statement
ALTER TABLE "public"."sessions" ADD COLUMN "impersonated_by" text;
--> statement-breakpoint
ALTER TABLE "public"."users" ADD COLUMN "banned" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "public"."users" ADD COLUMN "ban_reason" text;
--> statement-breakpoint
ALTER TABLE "public"."users" ADD COLUMN "ban_expires" timestamp;