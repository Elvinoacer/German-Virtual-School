
import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

// Default preferences for new users
const defaultPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  inAppNotifications: true,
  classReminders: true,
  assignmentAlerts: true,
  gradeNotifications: true,
  messageAlerts: true,
  paymentReminders: true,
  forumUpdates: true,
};

/**
 * GET /api/users/me/preferences
 * Fetch user's notification preferences (creates default if none exist)
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: payload.userId },
    });
    
    // Create default preferences if none exist
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: {
          userId: payload.userId,
          ...defaultPreferences,
        },
      });
    }
    
    return successResponse(preferences, "Preferences fetched");
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return errors.internal("Failed to fetch preferences");
  }
}

/**
 * PATCH /api/users/me/preferences
 * Update user's notification preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    const body = await request.json();
    
    // Only allow updating valid preference fields
    const allowedFields = [
      'emailNotifications',
      'pushNotifications',
      'inAppNotifications',
      'classReminders',
      'assignmentAlerts',
      'gradeNotifications',
      'messageAlerts',
      'paymentReminders',
      'forumUpdates',
    ];
    
    const updateData: Record<string, boolean> = {};
    for (const field of allowedFields) {
      if (typeof body[field] === 'boolean') {
        updateData[field] = body[field];
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return errors.badRequest("No valid preference fields provided");
    }
    
    // Upsert - create if doesn't exist, update if does
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: payload.userId },
      update: updateData,
      create: {
        userId: payload.userId,
        ...defaultPreferences,
        ...updateData,
      },
    });
    
    return successResponse(preferences, "Preferences updated");
  } catch (error) {
    console.error("Error updating preferences:", error);
    return errors.internal("Failed to update preferences");
  }
}
