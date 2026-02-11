import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";
import { notify } from "@/lib/notifications/orchestrator";
import { UserRole, MeetingAudience } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== "ADMIN") {
      return errors.forbidden("Access denied");
    }

    const meetings = await prisma.adminMeeting.findMany({
      orderBy: { startTime: "desc" },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: { select: { invitees: true } },
      },
    });

    return successResponse(meetings);
  } catch (error) {
    console.error("Get admin meetings error:", error);
    return errors.internal("Failed to fetch admin meetings");
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== "ADMIN") {
      return errors.forbidden("Only admins can create meetings");
    }

    const body = await request.json();
    const { title, description, audience, startTime, endTime, inviteeIds } =
      body;

    if (!title || !audience || !startTime || !endTime) {
      return errors.badRequest(
        "Title, audience, startTime, and endTime are required"
      );
    }

    // Validate audience enum
    const validAudiences: MeetingAudience[] = [
      "ALL_USERS",
      "ALL_TEACHERS",
      "ALL_STUDENTS",
      "SPECIFIC_TEACHERS",
      "SPECIFIC_STUDENTS",
    ];
    if (!validAudiences.includes(audience)) {
      return errors.badRequest("Invalid audience type");
    }

    // For specific audiences, inviteeIds are required
    if (
      (audience === "SPECIFIC_TEACHERS" || audience === "SPECIFIC_STUDENTS") &&
      (!inviteeIds || inviteeIds.length === 0)
    ) {
      return errors.badRequest(
        "inviteeIds are required for specific audience types"
      );
    }

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return errors.badRequest("End time must be after start time");
    }

    // Create meeting
    const meeting = await prisma.adminMeeting.create({
      data: {
        title,
        description: description || null,
        audience: audience as MeetingAudience,
        startTime: start,
        endTime: end,
        createdById: payload.userId,
      },
    });

    // Resolve target users for notifications (and invitees if specific)
    let targetUsers: { id: string; email: string; fcmTokens: string[] }[] = [];

    if (audience === "ALL_USERS") {
      targetUsers = await prisma.user.findMany({
        select: { id: true, email: true, fcmTokens: true },
      });
    } else if (audience === "ALL_STUDENTS") {
      targetUsers = await prisma.user.findMany({
        where: { role: UserRole.STUDENT },
        select: { id: true, email: true, fcmTokens: true },
      });
    } else if (audience === "ALL_TEACHERS") {
      targetUsers = await prisma.user.findMany({
        where: { role: UserRole.TEACHER },
        select: { id: true, email: true, fcmTokens: true },
      });
    } else if (
      audience === "SPECIFIC_TEACHERS" ||
      audience === "SPECIFIC_STUDENTS"
    ) {
      // Create invitee records
      await prisma.adminMeetingInvitee.createMany({
        data: inviteeIds.map((userId: string) => ({
          meetingId: meeting.id,
          userId,
        })),
        skipDuplicates: true,
      });

      targetUsers = await prisma.user.findMany({
        where: { id: { in: inviteeIds } },
        select: { id: true, email: true, fcmTokens: true },
      });
    }

    console.log(
      `[AdminMeeting] Sending meeting invite to ${targetUsers.length} users`
    );

    // Send notifications to all target users
    const startFormatted = start.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const notifications = targetUsers.map((user) =>
      notify({
        userId: user.id,
        title: `📅 Meeting: ${title}`,
        message: `You have been invited to a meeting at ${startFormatted}. Click to view details and join.`,
        type: "MEETING_INVITE",
        email: {
          to: user.email,
          from: process.env.ADMIN_EMAIL,
          subject: `📅 Meeting Invite: ${title}`,
        },
        push: { tokens: user.fcmTokens },
        metadata: {
          isBroadcast: true,
          senderId: payload.userId,
          meetingId: meeting.id,
          link: `/meeting/${meeting.id}`,
        },
      })
    );

    await Promise.allSettled(notifications);

    return successResponse(
      meeting,
      `Meeting created and ${targetUsers.length} users notified`
    );
  } catch (error) {
    console.error("Create admin meeting error:", error);
    return errors.internal("Failed to create meeting");
  }
}
