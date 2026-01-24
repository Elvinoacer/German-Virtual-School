
"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage, deleteToken, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

/**
 * Get the Firebase Messaging instance (for reuse in foreground handlers)
 */
export async function getMessagingInstance(): Promise<Messaging | null> {
  const isSupportedBrowser = await isSupported();
  if (!isSupportedBrowser) return null;
  
  const app = getFirebaseApp();
  if (!app) return null;
  
  return getMessaging(app);
}

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
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

/**
 * Setup foreground message handler - call this once when app mounts
 * Returns unsubscribe function
 */
export function setupForegroundHandler(
  onMessageReceived: (payload: { title: string; body: string; data?: Record<string, string> }) => void
): (() => void) | null {
  if (typeof window === "undefined") return null;
  
  // We need to do this async but return sync, so we set up a promise internally
  let unsubscribe: (() => void) | null = null;
  
  (async () => {
    const messaging = await getMessagingInstance();
    if (!messaging) return;
    
    unsubscribe = onMessage(messaging, (payload) => {
      console.log("[FCM] Foreground message received:", payload);
      onMessageReceived({
        title: payload.notification?.title || "New Notification",
        body: payload.notification?.body || "",
        data: payload.data,
      });
    });
  })();
  
  // Return a cleanup function that will unsubscribe when called
  return () => {
    if (unsubscribe) unsubscribe();
  };
}

/**
 * Delete FCM token from client and unregister from server
 * Call this on logout to prevent notifications going to wrong user
 */
export async function deleteAndUnregisterToken(): Promise<boolean> {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return false;
    
    // Get current token before deleting
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    
    if (currentToken) {
      // Notify server to remove this token from user's list
      try {
        await fetch("/api/notifications/unregister-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: currentToken }),
        });
      } catch (err) {
        console.error("[FCM] Failed to unregister token from server:", err);
      }
      
      // Delete token from Firebase
      await deleteToken(messaging);
      console.log("[FCM] Token deleted successfully");
    }
    
    return true;
  } catch (error) {
    console.error("[FCM] Error deleting token:", error);
    return false;
  }
}
