import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const payload = await authenticate(request);
    const { meetingId } = await params;

    const meeting = await prisma.adminMeeting.findUnique({
      where: { id: meetingId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        invitees: {
          select: { userId: true },
        },
      },
    });

    if (!meeting) {
      return errors.notFound("Meeting not found");
    }

    // Validate access based on audience
    const userRole = payload.role;
    const userId = payload.userId || payload.id;

    // Admin always has access
    if (userRole === "ADMIN") {
      return successResponse(meeting);
    }

    let hasAccess = false;

    switch (meeting.audience) {
      case "ALL_USERS":
        hasAccess = true;
        break;
      case "ALL_TEACHERS":
        hasAccess = userRole === "TEACHER";
        break;
      case "ALL_STUDENTS":
        hasAccess = userRole === "STUDENT";
        break;
      case "SPECIFIC_TEACHERS":
      case "SPECIFIC_STUDENTS":
        hasAccess = meeting.invitees.some((inv) => inv.userId === userId);
        break;
    }

    if (!hasAccess) {
      return errors.forbidden("You do not have access to this meeting");
    }

    return successResponse(meeting);
  } catch (error) {
    console.error("Get meeting error:", error);
    return errors.internal("Failed to fetch meeting details");
  }
}
