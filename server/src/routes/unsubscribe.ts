import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@db/index";
import { notificationsTable } from "@db/schema";
import { eq } from 'drizzle-orm'
import { ClientError } from "@src/error";

async function unsubscribe(
    fcmToken: string
) {
    const deleteRequest = await db.delete(notificationsTable)
        .where(eq(notificationsTable.fcmToken, fcmToken))

    if (deleteRequest.rowCount === 0) {
        throw new ClientError('NO_SUBSCRIPTION', 'User does not have an existing subscription')
    }
}

export const unsubscribeRouter: FastifyPluginAsync = async (
    fastify: FastifyInstance
  ) => {

    fastify.post(
        '/',
        {},
        async (request, reply) => {
            await unsubscribe(
                request.cookies["fcmToken"]!,
            )
            reply.code(200).send()
        }
    )
}
