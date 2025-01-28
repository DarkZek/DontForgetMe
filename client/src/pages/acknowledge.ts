import type { APIRoute } from 'astro'
import { db } from "@db/index"
import { notificationsTable } from '@db/schema';
import '@src/service/backend/firebase'
import { eq, sql } from 'drizzle-orm'
import { errorResponse } from '@src/service/response';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get("Content-Type") !== "application/json") {
    return errorResponse("Invalid content type")
  }

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

  const existingRecord = (await db.select()
    .from(notificationsTable)
    .where(eq(notificationsTable.fcmToken, fcmToken)))[0]

  // Calculate the watering time.
  // If this is their watering day, then to keep the watering time consistent,
  // we should add the interval days to the last watering day.
  // If they're late however we should add the interval days to the current day.
  const baseTime = new Date()

  // If watering day isn't older than 24 hours
  if (new Date().getTime() - existingRecord.nextWateringTime.getTime() < 24 * 60 * 60 * 1000) {
    baseTime.setTime(existingRecord.nextWateringTime.getTime())
  }

  // Add interval
  baseTime.setSeconds(baseTime.getSeconds() + existingRecord.intervalSeconds)

  // Update the record
  await db.update(notificationsTable)
    .set({
      lastWateringTime: existingRecord.nextWateringTime,
      nextWateringTime: baseTime,
      wateringAcknowledged: true
    })
    .where(eq(notificationsTable.fcmToken, fcmToken))

  return new Response(JSON.stringify({
    message: "Success"
  }))
}