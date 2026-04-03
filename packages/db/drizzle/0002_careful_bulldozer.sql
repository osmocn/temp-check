ALTER TABLE "app_session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "ban_expires" timestamp with time zone;