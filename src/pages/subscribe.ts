import { type Message, getMessaging } from 'firebase-admin/messaging'
import type { APIRoute } from 'astro'
import { db } from "@db/index"
import { notificationsTable } from '@db/schema';
import '@src/service/backend/firebase'

export const prerender = false;

const messaging = getMessaging()

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get("Content-Type") !== "application/json") {
    return new Response(JSON.stringify({
      message: "Invalid content type"
    }), {
      status: 400
    })
  }

  const body = await request.json()

  const { plantName } = body
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

  await db.insert(notificationsTable)
    .values({
      fcmToken,
      plantName: plantName,
      intervalSeconds: 60
    })

  if (!fcmToken) {
    return new Response(JSON.stringify({
      message: "Invalid token"
    }), {
      status: 400
    })
  }

  const message: Message = {
    notification: {
      title: 'Example Watering Notification',
      body: 'This is what your watering notification will look like'
    },
    token: fcmToken
  };

  try {
    await messaging.send(message)
  } catch (e: any) {
    if (e.code === 'messaging/registration-token-not-registered') {
      console.error('User disabled push notifications', JSON.stringify(e))
      throw new Error('User disabled push notifications')
    }

    throw e
  }

  return new Response(JSON.stringify({
    message: "Success"
  }))
}