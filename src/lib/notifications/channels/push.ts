
import "server-only";
import * as admin from "firebase-admin";
import { NotificationPayload, ChannelResult } from "../types";
import { prisma } from "@/lib/prisma";

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

/**
 * Remove invalid tokens from a user's fcmTokens array
 */
async function removeInvalidTokens(userId: string, invalidTokens: string[]) {
  if (invalidTokens.length === 0) return;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmTokens: true },
    });
    
    if (user) {
      const validTokens = (user.fcmTokens || []).filter(
        (token) => !invalidTokens.includes(token)
      );
      
      await prisma.user.update({
        where: { id: userId },
        data: { fcmTokens: validTokens },
      });
      
      console.log(`[Push] Removed ${invalidTokens.length} invalid tokens for user ${userId}`);
    }
  } catch (err) {
    console.error("[Push] Failed to remove invalid tokens:", err);
  }
}

export async function sendPushNotification(payload: NotificationPayload): Promise<ChannelResult> {
  const adminApp = getFirebaseAdmin();
  if (!adminApp) {
    return { success: false, error: "Firebase Admin not initialized" };
  }

  const { push } = payload;
  
  // Need at least tokens or a topic
  if (!push || (!push.tokens?.length && !push.topic)) {
    return { success: false, error: "No push tokens or topic provided" };
  }

  const invalidTokens: string[] = [];

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

    // Send to tokens
    if (push.tokens && push.tokens.length > 0) {
      if (push.tokens.length === 1) {
        try {
          await messaging.send({ ...messageBase, token: push.tokens[0] });
        } catch (error: any) {
          // Check for invalid token errors
          if (
            error.code === "messaging/registration-token-not-registered" ||
            error.code === "messaging/invalid-registration-token"
          ) {
            invalidTokens.push(push.tokens[0]);
            console.warn(`[Push] Token invalid, marking for removal: ${push.tokens[0].slice(0, 20)}...`);
          } else {
            throw error;
          }
        }
      } else {
        // Use multicast for multiple tokens
        const response = await messaging.sendEachForMulticast({ 
          ...messageBase, 
          tokens: push.tokens 
        });
        
        // Process multicast response to find failed tokens
        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success && resp.error) {
              const errorCode = resp.error.code;
              if (
                errorCode === "messaging/registration-token-not-registered" ||
                errorCode === "messaging/invalid-registration-token"
              ) {
                invalidTokens.push(push.tokens![idx]);
                console.warn(`[Push] Token invalid (multicast), marking for removal: ${push.tokens![idx].slice(0, 20)}...`);
              }
            }
          });
        }
        
        console.log(`[Push] Multicast result: ${response.successCount} success, ${response.failureCount} failed`);
      }
    }

    // Send to topic
    if (push.topic) {
      await messaging.send({ ...messageBase, topic: push.topic });
    }

    // Clean up invalid tokens asynchronously
    if (invalidTokens.length > 0 && payload.userId) {
      // Fire and forget - don't block the response
      removeInvalidTokens(payload.userId, invalidTokens).catch(() => {});
    }

    console.log(`[Push] Sent to ${push.tokens?.length || 0} tokens / topic ${push.topic || 'none'}`);
    
    return { 
      success: true,
      message: invalidTokens.length > 0 
        ? `Sent with ${invalidTokens.length} invalid tokens removed` 
        : undefined
    };

  } catch (error: any) {
    // Clean up any invalid tokens we found before the error
    if (invalidTokens.length > 0 && payload.userId) {
      removeInvalidTokens(payload.userId, invalidTokens).catch(() => {});
    }
    
    console.error("[Push] Failed:", error);
    return { success: false, error: error.message };
  }
}
