import { type Static, Type } from "@fastify/type-provider-typebox";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@db/index";
import { notificationsTable } from "@db/schema";
import { eq, sql } from 'drizzle-orm'
import { ClientError } from "@src/error";
import type { Message } from "firebase-admin/lib/messaging/messaging-api";
import { firebaseService } from "@src/services/firebase";
import { TokenHeader, type TokenHeaderType } from "./types";

export const RequestType = Type.Object({
    intervalSeconds: Type.Number({
        minimum: 86400,
        maximum: 2592000
    })
})

async function subscribe(
    fcmToken: string,
    intervalSeconds: number
) {
    const existingRecord = await db.select()
        .from(notificationsTable)
        .where(eq(notificationsTable.fcmToken, fcmToken))

    if (existingRecord.length > 0) {
        throw new ClientError("EXISTING_SUBSCRIPTION", "User already has an existing subscription")
    }

    const message: Message = {
        webpush: {
            notification: {
                title: '🌻 It\'s watering time for your plants!',
                body: 'This is an example of what your watering reminders will look like',
                actions: [
                    {
                        action: 'confirm',
                        title: 'Confirm'
                    },
                    {
                        action: 'delay',
                        title: 'Delay'
                    }
                ],
                badge: `${process.env.CLIENT_DOMAIN}/img/plant.png`,
                icon: `${process.env.CLIENT_DOMAIN}/img/plant.png`,
                image: `${process.env.CLIENT_DOMAIN}/img/plant.png`,
                renotify: true,
                vibrate: [200, 100, 200],
                tag: 'watering-reminder',
            },
            fcmOptions: {
                ...process.env.CLIENT_DOMAIN?.startsWith('https') ? {
                    link: `${process.env.CLIENT_DOMAIN}/subscription`
                } : {}
            }
        },
        token: fcmToken
    };

    try {
        await firebaseService.messaging.send(message)
        console.log('Sent initial message')
    } catch (e: any) {
        if (e.code === 'messaging/registration-token-not-registered') {
            throw new ClientError("USER_DISABLED_NOTIFICATIONS", "The user has disabled push notifications")
        }
        if (e.code === 'messaging/invalid-argument') {
            throw new ClientError("INVALID_FCM", "FCM is invalid")
        }
        console.warn('Failed to send initial message')

        throw e
    }

    
    await db.insert(notificationsTable)
        .values({
        fcmToken,
        intervalSeconds: intervalSeconds,
        nextWateringTime: sql.raw(`NOW() + INTERVAL '${intervalSeconds} seconds'`),
        wateringAcknowledged: true,
        lastWateringTime: sql`NOW()`
    })
}

export const subscribeRouter: FastifyPluginAsync = async (
    fastify: FastifyInstance
  ) => {

    fastify.post<{
        Body: Static<typeof RequestType>,
        Headers: TokenHeaderType
    }>(
        '/',
        {
            schema: {
                body: RequestType,
                headers: TokenHeader
            }
        },
        async (request, reply) => {
            await subscribe(
                request.headers.fcmtoken,
                request.body.intervalSeconds
            )
            reply.code(200).send({
                code: 'OK',
                message: 'Subscribed'
            })
        }
    )
}
