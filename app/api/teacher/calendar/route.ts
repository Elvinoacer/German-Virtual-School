import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, errors } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "TEACHER") {
      return errors.unauthorized();
    }

    const teacherId = session.user.id;

    // Fetch class sessions taught by the teacher
    const sessions = await prisma.classSession.findMany({
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
    });

    // Fetch assignments for courses taught by the teacher
    const assignments = await prisma.assignment.findMany({
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
    });

    return successResponse({
      sessions,
      assignments,
    });
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return errorResponse("Failed to fetch calendar data");
  }
}
