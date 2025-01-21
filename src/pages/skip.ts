import type { APIRoute } from 'astro'
import { db } from "@db/index"
import { notificationsTable } from '@db/schema';
import '@src/service/backend/firebase'
import { eq, sql } from 'drizzle-orm'
import { errorResponse } from '@src/service/response';

export const prerender = false;

// Moves your watering day to tomorrow
export const POST: APIRoute = async ({ request }) => {
  const cookies = request.headers.get('Cookie')

  const fcmToken = cookies?.split(';')
    .map(cookie => cookie.split('='))
    .findLast(([key]) => {
      return key.trim() === 'fcmToken'
    })?.[1]

  if (!fcmToken) {
    return new Response(JSON.stringify({
      message: "Invalid token"
    }), {
      status: 400
    })
  }

  const notification = (await db.select()
    .from(notificationsTable)
    .where(eq(notificationsTable.fcmToken, fcmToken)))[0]
    
  if (!notification) {
    return errorResponse("Not subscribed")
  }

  // If the last send date isn't within 24 hours
  if (notification.lastSentAt < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    return errorResponse("It's not a watering day")
  }

  await db.update(notificationsTable)
    .set({
      lastSentAt: sql`"lastSentAt" + interval '1 day'`
    })
    .where(eq(notificationsTable.fcmToken, fcmToken))

  return new Response(JSON.stringify({
    message: "Success"
  }))
}