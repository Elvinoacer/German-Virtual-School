
import "server-only";
import { createInAppNotification } from "./channels/inApp";
import { sendEmailNotification } from "./channels/email";
import { sendPushNotification } from "./channels/push";
import { NotificationPayload, ChannelResult } from "./types";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Map notification types to preference keys
const typeToPreferenceKey: Record<string, string> = {
  CLASS_REMINDER: "classReminders",
  SESSION_REMINDER: "classReminders",
  ASSIGNMENT_NEW: "assignmentAlerts",
  ASSIGNMENT_DUE: "assignmentAlerts",
  ASSIGNMENT_GRADED: "gradeNotifications",
  GRADE: "gradeNotifications",
  MESSAGE: "messageAlerts",
  MESSAGE_NEW: "messageAlerts",
  PAYMENT_DUE: "paymentReminders",
  PAYMENT: "paymentReminders",
  FORUM_REPLY: "forumUpdates",
  FORUM_NEW_POST: "forumUpdates",
};

interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  [key: string]: boolean;
}

async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const prefs = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });
    return prefs as UserPreferences | null;
  } catch {
    return null;
  }
}

function shouldSendForType(preferences: UserPreferences | null, type?: string): boolean {
  if (!preferences || !type) return true; // Default to sending if no preferences
  const preferenceKey = typeToPreferenceKey[type];
  if (!preferenceKey) return true; // Unknown type, send anyway
  return preferences[preferenceKey] !== false;
}

export async function notify(payload: NotificationPayload) {
  const results: Record<string, ChannelResult> = {};
  
  // Fetch user preferences
  const preferences = await getUserPreferences(payload.userId);
  
  // Check if this notification type is enabled for the user
  const typeEnabled = shouldSendForType(preferences, payload.type);
  if (!typeEnabled) {
    console.log(`[Notify] Skipping notification type ${payload.type} - disabled by user preferences`);
    return { skipped: true, reason: "User disabled this notification type" };
  }

  // 1. Create In-App Notification if enabled
  if (!preferences || preferences.inAppNotifications !== false) {
    const inAppResult = await createInAppNotification(payload);
    results["inApp"] = inAppResult;
  } else {
    results["inApp"] = { success: false, error: "Disabled by user preferences" };
  }
  
  const promises: Promise<any>[] = [];

  // 2. Send Email if requested AND enabled
  if (payload.email) {
    if (!preferences || preferences.emailNotifications !== false) {
      promises.push(
        sendEmailNotification(payload).then((res) => {
          results["email"] = res;
        })
      );
    } else {
      results["email"] = { success: false, error: "Disabled by user preferences" };
    }
  }

  // 3. Send Push if requested AND enabled
  if (payload.push) {
    if (!preferences || preferences.pushNotifications !== false) {
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
    } else {
      results["push"] = { success: false, error: "Disabled by user preferences" };
    }
  }

  await Promise.allSettled(promises);
  
  return results;
}
