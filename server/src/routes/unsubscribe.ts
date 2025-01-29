import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@db/index";
import { notificationsTable } from "@db/schema";
import { eq } from 'drizzle-orm'
import { ClientError } from "@src/error";
import { TokenHeader, TokenHeaderType } from "./types";

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

    fastify.post<{
        Headers: TokenHeaderType
    }>(
        '/',
        {
            schema: {
                headers: TokenHeader
            }
        },
        async (request, reply) => {
            await unsubscribe(
                request.headers.fcmtoken
            )
            reply.code(200).send({
                code: 'OK',
                message: 'Unsubscribed'
            })
        }
    )
}
