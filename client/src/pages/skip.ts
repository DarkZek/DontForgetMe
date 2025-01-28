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

  // If the last watering had been acknowledged and the next watering hasn't started yet
  if (notification.wateringAcknowledged && notification.nextWateringTime < new Date()) {
    return errorResponse("It's not a watering day")
  }

  await db.update(notificationsTable)
    .set({
      nextWateringTime: sql`"nextWateringTime" + interval '1 day'`
    })
    .where(eq(notificationsTable.fcmToken, fcmToken))

  return new Response(JSON.stringify({
    message: "Success"
  }))
}