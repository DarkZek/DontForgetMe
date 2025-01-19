
// Temporarily send message straight away

import { getMessaging, type Message } from 'firebase-admin/messaging'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import type { APIRoute } from 'astro'
import { db } from "@db/index"
import { notificationsTable } from '@db/schema';

export const prerender = false;

if (!getApps().length) {
  const serviceAccountData: string = atob(import.meta.env.FIREBASE_ADMIN_AUTH_BASE64!)
  const serviceAccount = JSON.parse(serviceAccountData)
  initializeApp({
    credential: cert(serviceAccount)
  })
}

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

  console.log(fcmToken)

  await db.insert(notificationsTable)
    .values({
      fcmToken,
      plantName: plantName,
      intervalMs: 1000 * 60
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
      title: 'This is the title',
      body: 'Body Content'
    },
    token: fcmToken
  };

  try {
    await getMessaging().send(message)
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