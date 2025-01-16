import { boolean, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("notifications", {
  id: uuid().primaryKey().defaultRandom(),
  createdAt: timestamp().defaultNow(),
  repeating: boolean()
});
