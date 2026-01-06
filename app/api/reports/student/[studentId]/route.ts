import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const payload = await authenticate(request);
    const { studentId } = await params;
    const { searchParams } = new URL(request.url);

    const courseId = searchParams.get('courseId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Authorization: student viewing own report or teacher/admin
    if (payload.role === 'STUDENT' && payload.userId !== studentId) {
      return errors.forbidden('Cannot view other students reports');
    }

    // Get student
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!student) {
      return errors.notFound('Student');
    }

    const where: any = { studentId };
    if (courseId) where.courseId = courseId;

    // Get enrollments
    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Build comprehensive report for each enrollment
    const reports = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Attendance stats
        const attendanceWhere: any = { studentId };
        const sessions = await prisma.classSession.findMany({
          where: { courseId: enrollment.courseId },
          select: { id: true },
        });

        const sessionIds = sessions.map(s => s.id);

        const attendanceRecords = await prisma.attendanceRecord.findMany({
          where: {
            studentId,
            classSessionId: { in: sessionIds },
          },
        });

        const attendance = {
          total: attendanceRecords.length,
          present: attendanceRecords.filter(a => a.status === 'PRESENT').length,
          absent: attendanceRecords.filter(a => a.status === 'ABSENT').length,
          excused: attendanceRecords.filter(a => a.status === 'EXCUSED').length,
          percentage: attendanceRecords.length > 0
            ? (attendanceRecords.filter(a => a.status === 'PRESENT').length / attendanceRecords.length) * 100
            : 0,
        };

        // Assignment stats
        const assignments = await prisma.assignment.findMany({
          where: { courseId: enrollment.courseId },
          include: {
            submissions: {
              where: { studentId },
            },
          },
        });

        const submittedAssignments = assignments.filter(a => a.submissions.length > 0);
        const lateSubmissions = submittedAssignments.filter(
          a => a.submissions[0]?.status === 'LATE'
        );

        const gradedSubmissions = submittedAssignments.filter(
          a => a.submissions[0]?.grade !== null
        );

        const averageScore = gradedSubmissions.length > 0
          ? gradedSubmissions.reduce((sum, a) => sum + (a.submissions[0].grade || 0), 0) / gradedSubmissions.length
          : 0;

        const assignmentStats = {
          total: assignments.length,
          submitted: submittedAssignments.length,
          late: lateSubmissions.length,
          missing: assignments.length - submittedAssignments.length,
          averageScore,
        };

        // Course progress
        const modules = await prisma.module.findMany({
          where: { courseId: enrollment.courseId },
        });

        const moduleProgress = await prisma.moduleProgress.findMany({
          where: {
            enrollmentId: enrollment.id,
          },
        });

        const courseProgress = {
          modulesCompleted: moduleProgress.filter(m => m.isCompleted).length,
          modulesTotal: modules.length,
          percentage: enrollment.progressPercentage,
        };

        return {
          course: enrollment.course,
          enrollment: {
            status: enrollment.status,
            enrolledAt: enrollment.enrolledAt,
          },
          attendance,
          assignments: assignmentStats,
          courseProgress,
        };
      })
    );

    return successResponse({
      student,
      reports,
    });
  } catch (error) {
    console.error('Get student report error:', error);
    return errors.internal('Failed to generate report');
  }
}
