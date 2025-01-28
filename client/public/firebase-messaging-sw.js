importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyBEeODfJCF2oXhGgXEo2pUb5ozYaDbWRJs",
    authDomain: "dontforgetme-b8c2a.firebaseapp.com",
    projectId: "dontforgetme-b8c2a",
    storageBucket: "dontforgetme-b8c2a.firebasestorage.app",
    messagingSenderId: "1010923990671",
    appId: "1:1010923990671:web:0d19b25998221342d0cafa",
    measurementId: "G-H4BTBZCG75"
  });

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = 'Background Message from html';

  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});