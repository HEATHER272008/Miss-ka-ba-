import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB7sm2x-LfSags6vTt5EiZJZ-m2Co8rCsY",
  authDomain: "smsj-4c7a6.firebaseapp.com",
  projectId: "smsj-4c7a6",
  storageBucket: "smsj-4c7a6.firebasestorage.app",
  messagingSenderId: "15481163538",
  appId: "1:15481163538:web:7800365624087ae2eaedcb",
  measurementId: "G-PCG37DVMKH"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

let messaging = null;

// Only initialize messaging if supported
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Firebase messaging not supported:', error);
  }
}

export { app, analytics, messaging, getToken, onMessage };
