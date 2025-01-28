ALTER TABLE "notifications" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "nextWateringTime" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "lastWateringTime" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "wateringAcknowledged" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "lastSentAt";