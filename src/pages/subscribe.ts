
// Temporarily send message straight away

import { getMessaging, type Message } from 'firebase-admin/messaging'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import type { APIRoute } from 'astro'

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

  const registrationToken = body.token

  if (!registrationToken) {
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
    token: registrationToken
  };

  const messageId = await getMessaging().send(message)

  console.log('Sent push notification with id ', messageId)

  return new Response(JSON.stringify({
    message: "Success"
  }))
}