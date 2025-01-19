import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const notificationsTable = pgTable("notifications", {
  id: uuid().primaryKey().defaultRandom(),
  createdAt: timestamp().defaultNow(),
  fcmToken: varchar({ length: 255 }).notNull(),
  lastSentAt: timestamp(),
  plantName: varchar({ length: 255 }).notNull(),
  intervalMs: integer().notNull(),
});
