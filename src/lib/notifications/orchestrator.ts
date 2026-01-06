
import "server-only";
import { createInAppNotification } from "./channels/inApp";
import { sendEmailNotification } from "./channels/email";
import { sendPushNotification } from "./channels/push";
import { NotificationPayload, ChannelResult } from "./types";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function notify(payload: NotificationPayload) {
  const results: Record<string, ChannelResult> = {};

  // 1. Always create In-App Notification (Primary Source of Truth)
  const inAppResult = await createInAppNotification(payload);
  results["inApp"] = inAppResult;
  
  const promises: Promise<any>[] = [];

  // 2. Send Email if requested
  if (payload.email) {
    promises.push(
      sendEmailNotification(payload).then((res) => {
        results["email"] = res;
      })
    );
  }

  // 3. Send Push if requested
  if (payload.push) {
    // If tokens are not provided, try to fetch from User model
    if (!payload.push.tokens && !payload.push.topic) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: payload.userId },
                select: { fcmTokens: true }
            });
            if (user?.fcmTokens && user.fcmTokens.length > 0) {
                payload.push.tokens = user.fcmTokens;
            }
        } catch (err) {
            console.error("Failed to fetch user FCM tokens", err);
        }
    }

    if (payload.push.tokens?.length || payload.push.topic) {
        promises.push(
          sendPushNotification(payload).then((res) => {
            results["push"] = res;
          })
        );
    }
  }

  // Socket.io emission would happen here if we can access the socket server instance 
  // or via a Redis/PubSub adapter if we are serverless. 
  // Since we are in Next.js App Router, direct socket access is tricky.
  // The existing socket.ts is client-side. Server-side socket logic usually lives in a separate server 
  // or a custom server.js. For now, we rely on polling for in-app updates, or use a POST to the socket server if it exposes an API.
  
  await Promise.allSettled(promises);
  
  return results;
}
