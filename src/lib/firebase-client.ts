
"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  if (typeof window === "undefined") return null;
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

export async function requestNotificationPermission() {
  const isSupportedBrowser = await isSupported();
  if (!isSupportedBrowser) {
    console.log("Notifications not supported in this browser");
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const app = getFirebaseApp();
    if (!app) return null;

    const messaging = getMessaging(app);
    try {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      return token;
    } catch (error) {
      console.error("An error occurred while retrieving token. ", error);
      return null;
    }
  } else {
    console.log("Unable to get permission to notify.");
    return null;
  }
}
