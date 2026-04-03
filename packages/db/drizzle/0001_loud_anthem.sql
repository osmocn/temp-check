DROP TABLE "app_invitation" CASCADE;--> statement-breakpoint
DROP TABLE "app_member" CASCADE;--> statement-breakpoint
DROP TABLE "app_organization" CASCADE;--> statement-breakpoint
ALTER TABLE "app_session" DROP COLUMN "active_organization_id";