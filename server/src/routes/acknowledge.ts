import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@db/index";
import { notificationsTable } from "@db/schema";
import { eq } from 'drizzle-orm'
import { ClientError } from "@src/error";

async function acknowledge(
    fcmToken: string
) {
    const existingRecord = (await db.select()
        .from(notificationsTable)
        .where(eq(notificationsTable.fcmToken, fcmToken)))[0]

    if (!existingRecord) {
        throw new ClientError('NOT_SUBSCRIBED', 'User is not subscribed')
    }

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
}

export const acknowledgeRouter: FastifyPluginAsync = async (
    fastify: FastifyInstance
  ) => {

    fastify.post(
        '/',
        {},
        async (request, reply) => {
            await acknowledge(
                request.cookies.fcmToken!,
            )
            reply.code(200).send({
                code: 'OK',
                message: 'Acknowledged'
            })
        }
    )
}
