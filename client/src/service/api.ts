import ax from 'axios'
import type { Subscription } from './types'

const axios = ax.create()

axios.defaults.baseURL = import.meta.env.PUBLIC_API_URL

export async function createSubscription(
    fcmToken: string,
    intervalSeconds: number
): Promise<void> {
    await axios.post("/subscribe", {
        intervalSeconds,
    }, {
        headers: {
            fcmtoken: fcmToken
        }
    })

    window.localStorage.setItem('fcmToken', fcmToken)
}

export async function removeSubscription() {
    await axios.post("/unsubscribe", {}, {
        headers: {
            fcmtoken: window.localStorage.getItem('fcmToken')
        }
    })

    window.localStorage.removeItem('fcmToken')
}

export async function getSubscription(): Promise<Subscription> {
    const subscription = await axios.get("/subscription", {
        headers: {
            fcmtoken: window.localStorage.getItem('fcmToken')
        }
    })
    
    return {
        ...subscription.data.subscription,
        createdAt: new Date(subscription.data.subscription.createdAt),
        nextWateringTime: new Date(subscription.data.subscription.nextWateringTime),
        lastWateringTime: new Date(subscription.data.subscription.lastWateringTime),
    }
}

export async function delayDay(): Promise<void> {
    await axios.post("/skip", {}, {
        headers: {
            fcmtoken: window.localStorage.getItem('fcmToken')
        }
    })
}

export async function acknowledgeWatering(): Promise<void> {
    await axios.post("/acknowledge", {}, {
        headers: {
            fcmtoken: window.localStorage.getItem('fcmToken')
        }
    })
}