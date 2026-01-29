
import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";
import { notify } from "@/lib/notifications/orchestrator";
import { UserRole } from '@/generated/prisma/client';

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== "ADMIN") {
      return errors.forbidden("Only admins can broadcast notifications");
    }

    const body = await request.json();
    const { title, message, target, courseId, type } = body;

    if (!title || !message || !target) {
      return errors.badRequest("Title, message, and target are required");
    }

    let users: { id: string; email: string; fcmTokens: string[] }[] = [];

    // Fetch target users
    if (target === "ALL_USERS") {
      users = await prisma.user.findMany({ select: { id: true, email: true, fcmTokens: true } });
    } else if (target === "ALL_STUDENTS") {
      users = await prisma.user.findMany({ 
        where: { role: UserRole.STUDENT },
        select: { id: true, email: true, fcmTokens: true } 
      });
    } else if (target === "ALL_TEACHERS") {
        users = await prisma.user.findMany({ 
            where: { role: UserRole.TEACHER },
            select: { id: true, email: true, fcmTokens: true } 
        });
    } else if (target === "COURSE_STUDENTS" && courseId) {
       users = await prisma.user.findMany({
         where: {
            enrollments: {
                some: { courseId: courseId }
            }
         },
         select: { id: true, email: true, fcmTokens: true }
       });
    } else {
        return errors.badRequest("Invalid target or missing courseId");
    }

    console.log(`[Broadcast] Sending to ${users.length} users`);

    // Save Broadcast History
    await prisma.broadcast.create({
      data: {
        title,
        message,
        target,
        courseId,
        type: type || "INFO",
        senderId: payload.userId,
        recipientCount: users.length
      }
    });

    // We process in batches/background in a real queue, but here we parallelize
    // For very large numbers, this might time out Vercel functions (10s limit on hobby).
    // Ideally, use a queue. For now, we assume manageable user base.
    
    const notifications = users.map(user => 
        notify({
            userId: user.id,
            title,
            message,
            type: type || "INFO",
            email: { 
              to: user.email,
              from: process.env.ADMIN_EMAIL, // Use ADMIN_EMAIL for broadcasts
              subject: `📢 ${title}` // Add emoji and title as subject
            },
            push: { tokens: user.fcmTokens }, // Send push if available
            metadata: {
                isBroadcast: true,
                senderId: payload.userId
            }
        })
    );

    // Fire and forget mechanism for huge lists? 
    // Or await all? Awaiting all is safer for response but slower.
    // Let's await Promise.all for now.
    await Promise.allSettled(notifications);

    return successResponse({ count: users.length }, `Broadcast sent to ${users.length} users`);

  } catch (error) {
    console.error("Broadcast error:", error);
    return errors.internal("Failed to broadcast notification");
  }
}
