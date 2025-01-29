import axios from 'axios'

axios.defaults.baseURL = import.meta.env.PUBLIC_API_URL

export async function createSubscription(
    fcmToken: string,
    intervalSeconds: number
) {
    await axios.post("/subscribe", {
        fcmToken,
        intervalSeconds,
    })
}