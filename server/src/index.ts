import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { subscribeRouter } from './routes/subscribe'
import { ClientError } from './error'

const server = fastify({
  logger: true
})

server.register(cookie)

server.setErrorHandler(async function (error, _request, reply) {
  if (error instanceof ClientError) {
    return reply.code(400).send({
      code: error.code,
      message: error.message
    })
  } else {
    this.log.error({
      error,
      json: JSON.stringify(error)
    })
    reply.status(500).send({
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred'
     })
  }
})

server.register((server) => {
  server.addHook('onRequest', async (request, reply) => {
    // Ensure fcmToken is set
    if (!request.cookies['fcmToken']) {
        return reply.code(400).send({
          message: 'fcmToken cookie is required'
        })
    }
  })

  server.register(subscribeRouter, { prefix: '/subscribe' })
})

server.get('/status', async (_1, _2) => {
  return 'up\n'
})

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})