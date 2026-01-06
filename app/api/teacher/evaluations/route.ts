import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";
import { calculateEvaluationGrade } from "@/lib/grading";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return errors.forbidden("Only teachers and admins can create evaluations");
    }

    const body = await request.json();
    const {
      studentId,
      courseId,
      attendanceScore,
      participationScore,
      assignmentScore,
      languageProficiency,
      behaviorScore,
      overallComment,
      improvements,
      category,
    } = body;

    if (!studentId || !courseId || !category) {
      return errors.badRequest("Missing required fields (studentId, courseId, category)");
    }

    // Verify course belongs to teacher
    if (user.role === "TEACHER") {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (course?.teacherId !== user.id) {
        return errors.forbidden("You can only evaluate students in your own courses");
      }
    }

    const metrics = {
      attendanceScore: parseFloat(attendanceScore),
      participationScore: parseFloat(participationScore),
      assignmentScore: parseFloat(assignmentScore),
      languageProficiency: parseFloat(languageProficiency),
      behaviorScore: parseFloat(behaviorScore || 0),
    };

    const finalGrade = calculateEvaluationGrade(metrics);

    const evaluation = await prisma.evaluation.create({
      data: {
        studentId,
        courseId,
        teacherId: user.id,
        ...metrics,
        grade: finalGrade,
        overallComment,
        improvements,
        category,
      },
    });

    return successResponse(evaluation, "Evaluation created successfully", 201);
  } catch (error) {
    console.error("Create evaluation error:", error);
    return errors.internal("Failed to create evaluation");
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const courseId = searchParams.get("courseId");

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (courseId) where.courseId = courseId;

    // Access control: Teachers only see evaluations they created or for their courses
    if (user.role === "TEACHER") {
      where.OR = [
        { teacherId: user.id },
        { course: { teacherId: user.id } }
      ];
    } else if (user.role === "STUDENT") {
      // Students only see their own evaluations
      where.studentId = user.id;
    }

    const evaluations = await prisma.evaluation.findMany({
      where,
      include: {
        course: {
          select: { title: true, level: true }
        },
        teacher: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(evaluations);
  } catch (error) {
    console.error("Get evaluations error:", error);
    return errors.internal("Failed to fetch evaluations");
  }
}
