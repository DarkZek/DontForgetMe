import { boolean,integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const notificationsTable = pgTable("notifications", {
  id: uuid().primaryKey().defaultRandom(),
  createdAt: timestamp({
    withTimezone: true
  }).defaultNow(),
  fcmToken: varchar({ length: 255 }).notNull().unique(),
  nextWateringTime: timestamp({
    withTimezone: true
  }).notNull(),
  wateringAcknowledged: boolean().notNull(),
  intervalSeconds: integer().notNull(),
});
