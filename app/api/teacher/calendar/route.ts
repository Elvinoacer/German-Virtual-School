import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, errors } from "@/lib/api-response";
import { MeetingAudience } from "@/generated/prisma/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "TEACHER") {
      return errors.unauthorized();
    }

    const teacherId = session.user.id;

    const [classSessions, assignments, adminMeetings] = await Promise.all([
      // Fetch class sessions taught by the teacher
      prisma.classSession.findMany({
        where: {
          teacherId: teacherId,
        },
        include: {
          course: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          startTime: "asc",
        },
      }),
      // Fetch assignments for courses taught by the teacher
      prisma.assignment.findMany({
        where: {
          course: {
            teacherId: teacherId,
          },
        },
        include: {
          course: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          dueDate: "asc",
        },
      }),
      // Fetch admin meetings for this teacher
      prisma.adminMeeting.findMany({
        where: {
          OR: [
            { audience: MeetingAudience.ALL_USERS },
            { audience: MeetingAudience.ALL_TEACHERS },
            { audience: MeetingAudience.SPECIFIC_TEACHERS, invitees: { some: { userId: teacherId } } },
          ],
        },
        include: {
          createdBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { startTime: "asc" },
      }),
    ]);

    // Transform admin meetings to look like sessions
    const meetingSessions = adminMeetings.map((m) => ({
      ...m,
      isAdminMeeting: true,
      course: { title: "Admin Meeting" },
    }));

    return successResponse({
      sessions: [...classSessions, ...meetingSessions],
      assignments,
    });
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return errorResponse("Failed to fetch calendar data");
  }
}

