import type { APIRoute } from 'astro'
import { db } from "@db/index"
import { notificationsTable } from '@db/schema';
import '@src/service/backend/firebase'
import { eq } from 'drizzle-orm'
import { errorResponse } from '@src/service/response';

export const prerender = false;

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

  const deleteRequest = await db.delete(notificationsTable)
    .where(eq(notificationsTable.fcmToken, fcmToken))
    
  if (deleteRequest.rowCount === 0) {
    return errorResponse("Not subscribed")
  }

  return new Response(JSON.stringify({
    message: "Success"
  }))
}