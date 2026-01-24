
import "server-only";
import { prisma } from "@/lib/prisma";
import { NotificationPayload, ChannelResult } from "../types";
import { NotificationType } from '@/generated/prisma/client';

export const runtime = "nodejs";

export async function createInAppNotification(payload: NotificationPayload): Promise<ChannelResult & { id?: string }> {
  const { userId, title, message, metadata, type } = payload;

  if (!userId) {
     return { success: false, error: "Missing userId" };
  }

  // Map string type to Enum if possible, default to INFO
  let notificationType: NotificationType = NotificationType.INFO;
  if (type && Object.values(NotificationType).includes(type as NotificationType)) {
    notificationType = type as NotificationType;
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: notificationType,
        data: metadata || {},
        isRead: false,
      },
    });

    console.log(`[InApp] Created notification ${notification.id} for user ${userId}`);
    return { success: true, id: notification.id };
  } catch (error: any) {
    console.error("[InApp] Failed:", error);
    return { success: false, error: error.message };
  }
}
