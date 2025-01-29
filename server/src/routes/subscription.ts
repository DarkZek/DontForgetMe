import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@db/index";
import { notificationsTable } from "@db/schema";
import { eq, type InferSelectModel } from 'drizzle-orm'
import { ClientError } from "@src/error";
import { TokenHeader, type TokenHeaderType } from "./types";

async function getSubscription(
    fcmToken: string
): Promise<InferSelectModel<typeof notificationsTable>> {
    const existingRecord = await db.select()
        .from(notificationsTable)
        .where(eq(notificationsTable.fcmToken, fcmToken))

    if (existingRecord.length === 0) {
        throw new ClientError("NO_SUBSCRIPTION", "User already no subscription")
    }

    return existingRecord[0]!
}

export const subscriptionRouter: FastifyPluginAsync = async (
    fastify: FastifyInstance
  ) => {

    fastify.get<{
        Headers: TokenHeaderType
    }>(
        '/',
        {
            schema: {
                headers: TokenHeader
            }
        },
        async (request, reply) => {
            const subscription = await getSubscription(
                request.headers.fcmtoken
            )
            reply.code(200).send({
                subscription
            })
        }
    )
}
