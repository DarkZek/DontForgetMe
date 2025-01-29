import { initializeApp, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'

export class FirebaseService {

    messaging: ReturnType<typeof getMessaging>

    constructor() {
        const serviceAccountBase64 = process.env.FIREBASE_ADMIN_AUTH_BASE64

        if (!serviceAccountBase64) {
            throw new Error('FIREBASE_ADMIN_AUTH_BASE64 must be set')
        }

        const serviceAccountData: string = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
        const serviceAccount = JSON.parse(serviceAccountData)
        
        initializeApp({
          credential: cert(serviceAccount)
        })

        this.messaging = getMessaging()
    }
}

const firebaseService = new FirebaseService()

export { firebaseService }