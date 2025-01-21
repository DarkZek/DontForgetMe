import { type Message, getMessaging } from 'firebase-admin/messaging'
import type { APIRoute } from 'astro'
import { db } from "@db/index"
import { notificationsTable } from '@db/schema';
import '@src/service/backend/firebase'
import { eq } from 'drizzle-orm'
import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { errorResponse } from '@src/service/response';

export const prerender = false;

const messaging = getMessaging()

export const RequestType = Type.Object({
  intervalSeconds: Type.Number({
    minimum: 86400,
    maximum: 2592000
  })
})

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get("Content-Type") !== "application/json") {
    return errorResponse("Invalid content type")
  }

  const body = await request.json()

  if (!Value.Check(RequestType, body)) {
    return errorResponse("Invalid request body")
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

  const existingRecord = await db.select()
    .from(notificationsTable)
    .where(eq(notificationsTable.fcmToken, fcmToken))

  if (existingRecord.length > 0) {
    return errorResponse("Already subscribed")
  }

  await db.insert(notificationsTable)
    .values({
      fcmToken,
      intervalSeconds: body.intervalSeconds
    })

  if (!fcmToken) {
    return errorResponse("Invalid token")
  }

  const message: Message = {
    notification: {
      title: '🌻 It\'s watering time for your plants!',
      body: 'This is an example of what your watering reminders will look like'
    },
    token: fcmToken
  };

  try {
    console.log('Sending', message)
    await messaging.send(message)
  } catch (e: any) {
    if (e.code === 'messaging/registration-token-not-registered') {
      console.error('User disabled push notifications', JSON.stringify(e))
      return errorResponse("User disabled push notifications")
    }

    throw e
  }

  return new Response(JSON.stringify({
    message: "Success"
  }))
}