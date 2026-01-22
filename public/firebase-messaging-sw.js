importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB7sm2x-LfSags6vTt5EiZJZ-m2Co8rCsY",
  authDomain: "smsj-4c7a6.firebaseapp.com",
  projectId: "smsj-4c7a6",
  storageBucket: "smsj-4c7a6.firebasestorage.app",
  messagingSenderId: "15481163538",
  appId: "1:15481163538:web:7800365624087ae2eaedcb",
  measurementId: "G-PCG37DVMKH"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'CathoLink';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
