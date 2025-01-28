import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@db/index";
import { notificationsTable } from "@db/schema";
import { eq, sql } from 'drizzle-orm'
import { ClientError } from "@src/error";

async function skip(
    fcmToken: string
) {
    const notification = (await db.select()
      .from(notificationsTable)
      .where(eq(notificationsTable.fcmToken, fcmToken)))[0]
      
    if (!notification) {
        throw new ClientError('NOT_SUBSCRIBED', 'User is not subscribed')
    }
  
    // If the last watering had been acknowledged and the next watering hasn't started yet
    if (notification.wateringAcknowledged && notification.nextWateringTime < new Date()) {
        throw new ClientError('NOT_SUBSCRIBED', 'Its not watering day')
    }
  
    await db.update(notificationsTable)
      .set({
        nextWateringTime: sql`"nextWateringTime" + interval '1 day'`
      })
      .where(eq(notificationsTable.fcmToken, fcmToken))
}

export const skipRouter: FastifyPluginAsync = async (
    fastify: FastifyInstance
  ) => {

    fastify.post(
        '/',
        {},
        async (request, reply) => {
            await skip(
                request.cookies["fcmToken"]!,
            )
            reply.code(200).send()
        }
    )
}
