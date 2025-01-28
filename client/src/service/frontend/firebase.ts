import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBEeODfJCF2oXhGgXEo2pUb5ozYaDbWRJs",
  authDomain: "dontforgetme-b8c2a.firebaseapp.com",
  projectId: "dontforgetme-b8c2a",
  storageBucket: "dontforgetme-b8c2a.firebasestorage.app",
  messagingSenderId: "1010923990671",
  appId: "1:1010923990671:web:0d19b25998221342d0cafa",
  measurementId: "G-H4BTBZCG75"
};

const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

// Returns 
async function requestPermission(askPermission: boolean = true) {
  console.log('Requesting permission...');
  
  const currentToken = await getToken(messaging, { vapidKey: 'BHFfVJ5LVRWtMS8__xhLO1L5kF1IBGti5MVrQApV2QI00OXTknLx4igvEYT_b7icf-rmCeU3iGYhGZfqP7pw0Qc' })
  
  if (!currentToken && askPermission) {
    // Show permission request UI
    console.log('No registration token available. Requesting permission to generate one.');

    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      throw new Error('Permission not granted')
    }

    // Retry `getToken` with no asking for permission to prevent infinite loops
    return requestPermission(false)
  }

  return currentToken
}

export { app, messaging, requestPermission }