import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { loadEnv } from "vite"

if (!getApps().length) {
  const serviceAccountBase64 = loadEnv(process.env.NODE_ENV!, process.cwd(), "").FIREBASE_ADMIN_AUTH_BASE64
  const serviceAccountData: string = atob(serviceAccountBase64)
  const serviceAccount = JSON.parse(serviceAccountData)
  
  initializeApp({
    credential: cert(serviceAccount)
  })
}
