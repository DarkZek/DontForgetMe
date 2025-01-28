CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"fcmToken" varchar(255) NOT NULL,
	"lastSentAt" timestamp DEFAULT now() NOT NULL,
	"intervalSeconds" integer NOT NULL,
	CONSTRAINT "notifications_fcmToken_unique" UNIQUE("fcmToken")
);
