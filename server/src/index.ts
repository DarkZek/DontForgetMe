import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { subscribeRouter } from './routes/subscribe'
import { ClientError } from './error'
import { skipRouter } from './routes/skip'
import { unsubscribeRouter } from './routes/unsubscribe'
import { acknowledgeRouter } from './routes/acknowledge'
import { startCron } from './cron'
import cors, { type FastifyCorsOptions } from '@fastify/cors'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'

async function run() {
  const server = fastify({
    logger: true,
  }).withTypeProvider<TypeBoxTypeProvider>()

  await server.register(cors, {
    origin: 'http://localhost:4321',
    credentials: true
  } satisfies FastifyCorsOptions)

  await server.setErrorHandler(async function (error, _request, reply) {
    if (error instanceof ClientError) {
      reply.code(400).send({
        code: error.code,
        message: error.message
      })
      return
    }

    if (error instanceof Error && error.code === 'FST_ERR_VALIDATION') {
      reply.code(400).send({
        code: 'INVALID_REQUEST',
        message: error.message
      })
      return
    }

    this.log.error({
      error,
      json: JSON.stringify(error)
    })
    reply.status(500).send({
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred'
    })
  })

  await server.register(cookie)

  await server.register(subscribeRouter, { prefix: '/subscribe' })

  await server.register((server) => {
    server.addHook('onRequest', async (request, reply) => {
      // Ensure fcmToken is set
      if (!request.cookies.fcmToken) {
        reply.code(400).send({
          code: 'MISSING_FCM_TOKEN',
          message: 'fcmToken cookie is required'
        })
      }
    })

    server.register(skipRouter, { prefix: '/skip' })
    server.register(unsubscribeRouter, { prefix: '/unsubscribe' })
    server.register(acknowledgeRouter, { prefix: '/acknowledge' })
  })

  server.get('/status', async (_1, _2) => {
    return 'up\n'
  })

  await server.ready()

  await server.listen({ port: 3000 }, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })

  startCron()
}
run()