import { type Message, getMessaging } from 'firebase-admin/messaging'
import { db } from '../../db/index'
import { notificationsTable } from '../../db/schema'
import { and, eq, isNull, or, sql } from 'drizzle-orm'
import '../../service/backend/firebase'

const messaging = getMessaging()

export async function notify() {
    // Fetch all notifications that need to be sent
    const notifications = await db.select().from(notificationsTable)
        .where(or(
            sql`NOW() - "lastSentAt" > make_interval(secs => "intervalSeconds")`,
            and(
                isNull(notificationsTable.lastSentAt),
                sql`NOW() - "createdAt" > make_interval(secs => "intervalSeconds")`,
            )
        ))

    // Send notifications
    for (const notification of notifications) {
        // Send notification
          const message: Message = {
            notification: {
              title: '🌻 It\'s watering time for your plants!',
              body: 'Click to confirm or delay watering'
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
            .set({ lastSentAt: sql`NOW()` })
            .where(eq(notificationsTable.id, notification.id))
    }
}