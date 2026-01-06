
import "server-only";
import * as admin from "firebase-admin";
import { NotificationPayload, ChannelResult } from "../types";

export const runtime = "nodejs";

function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.error("[Push] Missing Firebase credentials");
    return null;
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export async function sendPushNotification(payload: NotificationPayload): Promise<ChannelResult> {
  const adminApp = getFirebaseAdmin();
  if (!adminApp) {
    return { success: false, error: "Firebase Admin not initialized" };
  }

  const { push } = payload;
  
  // Need at least tokens or a topic
  if (!push || (!push.tokens?.length && !push.topic)) {
    // If no explicit push config, maybe look up tokens from DB?
    // For now, orchestrator should handle token lookup and pass them here.
    return { success: false, error: "No push tokens or topic provided" };
  }

  try {
    const messaging = adminApp.messaging();
    
    // Construct base message
    const messageBase = {
      notification: {
        title: payload.title,
        body: payload.message,
      },
      data: {
        ...push.data,
        // Ensure values are strings for FCM
        url: payload.metadata?.link || "",  
        click_action: payload.metadata?.link || "",
      },
    };

    const promises: Promise<any>[] = [];

    // Send to tokens
    if (push.tokens && push.tokens.length > 0) {
      if (push.tokens.length === 1) {
         promises.push(messaging.send({ ...messageBase, token: push.tokens[0] }));
      } else {
         promises.push(messaging.sendEachForMulticast({ ...messageBase, tokens: push.tokens }));
      }
    }

    // Send to topic
    if (push.topic) {
        promises.push(messaging.send({ ...messageBase, topic: push.topic }));
    }

    await Promise.all(promises);
    console.log(`[Push] Sent to ${push.tokens?.length || 0} tokens / topic ${push.topic || 'none'}`);
    
    return { success: true };

  } catch (error: any) {
    console.error("[Push] Failed:", error);
    return { success: false, error: error.message };
  }
}
