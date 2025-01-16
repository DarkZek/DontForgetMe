
// Temporarily send message straight away

import { getMessaging, type Message } from 'firebase-admin/messaging'
import { initializeApp, cert, getApp } from 'firebase-admin/app'
import type { APIRoute } from 'astro'

export const prerender = false;

if (!getApp()) {
  const serviceAccountData: string = atob(process.env.FIREBASE_ADMIN_AUTH_BASE64!)
  const serviceAccount = JSON.parse(serviceAccountData)
  initializeApp({
    credential: cert(serviceAccount)
  })
}

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get("Content-Type") !== "application/json") {
    throw new Error('Invalid content type')
  }

  const body = await request.json()

  console.log(request)

  // This registration token comes from the client FCM SDKs.
  const registrationToken = body.token;

  const message: Message = {
    notification: {
      title: 'This is the title',
      body: 'Body Content'
    },
    token: registrationToken
  };

  // Send a message to the device corresponding to the provided
  // registration token.
  await getMessaging().send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });

  return new Response(JSON.stringify({
    message: "Success"
  }))
}