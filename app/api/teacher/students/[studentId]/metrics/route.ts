import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const user = await authenticate(request);

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return errors.badRequest("courseId is required");
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return errors.forbidden("Only teachers and admins can access student metrics");
    }

    // Verify course belongs to teacher
    if (user.role === "TEACHER") {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (course?.teacherId !== user.id) {
        return errors.forbidden("You do not have access to this course's metrics");
      }
    }

    // 1. Calculate Attendance Score
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        studentId,
        classSession: {
          courseId,
        },
      },
    });

    const presentCount = attendanceRecords.filter((r) => r.status === "PRESENT").length;
    const totalAttendance = attendanceRecords.length;
    const attendanceScore = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

    // 2. Calculate Assignment Performance
    const submissions = await prisma.submission.findMany({
      where: {
        studentId,
        assignment: {
          courseId,
        },
        status: "GRADED",
      },
      include: {
        assignment: true,
      },
    });

    let totalPointsEarned = 0;
    let totalMaxPoints = 0;

    submissions.forEach((s) => {
      if (s.grade !== null) {
        totalPointsEarned += s.grade;
        totalMaxPoints += s.assignment.maxPoints;
      }
    });

    const assignmentScore = totalMaxPoints > 0 ? (totalPointsEarned / totalMaxPoints) * 100 : 0;

    return successResponse({
      attendanceScore: Math.round(attendanceScore),
      assignmentScore: Math.round(assignmentScore),
      totalAssignments: submissions.length,
      presentCount,
      totalAttendance,
    });
  } catch (error) {
    console.error("Get student metrics error:", error);
    return errors.internal("Failed to fetch student metrics");
  }
}
