export type Subscription = {
    id: string,
    createdAt: Date,
    fcmToken: string,
    nextWateringTime: Date,
    lastWateringTime: Date,
    wateringAcknowledged: boolean,
    intervalSeconds: number,
}