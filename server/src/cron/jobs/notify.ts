import { type Message, getMessaging } from 'firebase-admin/messaging'
import { db } from '@db/index'
import { notificationsTable } from '@db/schema'
import { and, eq, sql } from 'drizzle-orm'

const messaging = getMessaging()

export async function notify() {
    // Fetch all notifications that need to be sent
    const notifications = await db.select().from(notificationsTable)
        .where(and(
            sql`"nextWateringTime" < NOW()`,
            eq(notificationsTable.wateringAcknowledged, true),
        ))

    // Send notifications
    for (const notification of notifications) {
        // Send notification
          const message: Message = {
            webpush: {
                notification: {
                    title: '🌧️ Watering time!',
                    body: 'Click to confirm or delay watering',
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
            token: notification.fcmToken
          };
        
        try {
            await messaging.send(message)
        } catch (e: any) {
            if (e.code === 'messaging/registration-token-not-registered') {
                console.error('User disabled push notifications', JSON.stringify(e))
                throw new Error('User disabled push notifications')
            }

            console.error('Failed to send notification', JSON.stringify(e))
            continue
        }

        // Update lastSentAt
        await db.update(notificationsTable)
            .set({ wateringAcknowledged: false })
            .where(eq(notificationsTable.id, notification.id))

        console.log('Sent notification', notification.id)
    }
}