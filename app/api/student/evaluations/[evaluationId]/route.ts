import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { calculateEvaluationGrade } from '@/lib/grading';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ evaluationId: string }> }
) {
  try {
    const payload = await authenticate(request);
    const { evaluationId } = await params;

    // 1. Try to find a real Evaluation
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        course: {
          include: {
            teacher: { select: { firstName: true, lastName: true, avatarUrl: true } }
          }
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            createdAt: true,
            studentProfile: true,
            id: true
          }
        }
      }
    });

    if (evaluation) {
      // Ensure the student owns this evaluation
      if (evaluation.studentId !== payload.id && payload.role === 'STUDENT') {
        return errors.forbidden('Access denied to this evaluation');
      }

      const calculatedGrade = calculateEvaluationGrade(evaluation);

      return successResponse({
        student: {
          name: `${evaluation.student.firstName} ${evaluation.student.lastName}`,
          avatar: evaluation.student.avatarUrl,
          id: evaluation.student.id.slice(0, 8),
          joinedAt: evaluation.student.createdAt
        },
        course: {
          name: evaluation.course.title,
          teacher: `${evaluation.course.teacher.firstName} ${evaluation.course.teacher.lastName}`,
          teacherAvatar: evaluation.course.teacher.avatarUrl
        },
        stats: {
          averageGrade: calculatedGrade.toFixed(1),
          attendancePercentage: evaluation.attendanceScore ?? 0,
          assignmentCompletion: "Evaluated",
          totalAssignments: 0
        },
        metrics: {
          attendanceScore: evaluation.attendanceScore ?? 0,
          assignmentScore: evaluation.assignmentScore ?? 0,
          participationScore: evaluation.participationScore ?? 0,
          behaviorScore: (evaluation as any).behaviorScore ?? 0,
          cefrLevel: evaluation.course.level 
        },
        timeline: [
          {
            id: evaluation.id,
            title: "Term Evaluation: " + evaluation.category,
            date: evaluation.createdAt.toISOString(),
            grade: calculatedGrade.toFixed(0),
            feedback: evaluation.overallComment || "No feedback provided."
          }
        ],
        comments: [
          {
            id: evaluation.id,
            text: evaluation.overallComment,
            date: evaluation.createdAt.toISOString(),
            teacher: `${evaluation.course.teacher.firstName} ${evaluation.course.teacher.lastName}`,
            avatar: evaluation.course.teacher.avatarUrl
          },
          {
             id: evaluation.id + "-imp",
             text: "Areas for improvement: " + (evaluation.improvements || "None specified."),
             date: evaluation.createdAt.toISOString(),
             teacher: `${evaluation.course.teacher.firstName} ${evaluation.course.teacher.lastName}`,
             avatar: evaluation.course.teacher.avatarUrl
          }
        ]
      });
    }

    // 2. Fallback: Try to find an Enrollment (Live Report)
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: evaluationId },
      include: {
        course: {
          include: {
            teacher: { select: { firstName: true, lastName: true, avatarUrl: true } }
          }
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            createdAt: true,
            studentProfile: true,
            id: true
          }
        }
      }
    });

    if (!enrollment) {
      return errors.notFound('Evaluation or Enrollment not found');
    }

    if (enrollment.studentId !== payload.id && payload.role === 'STUDENT') {
      return errors.forbidden('Access denied to this evaluation');
    }

    // Fetch Course Specific Stats
    const [attendanceRecords, submissions] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where: {
          studentId: enrollment.studentId,
          classSession: { courseId: enrollment.courseId }
        },
        select: { status: true, checkInTime: true }
      }),
      prisma.submission.findMany({
        where: {
          studentId: enrollment.studentId,
          assignment: { courseId: enrollment.courseId },
          grade: { not: null }
        },
        select: {
          grade: true,
          feedback: true,
          gradedAt: true,
          assignment: { select: { title: true } },
          gradedBy: { select: { firstName: true, lastName: true, avatarUrl: true } }
        },
        orderBy: { gradedAt: 'desc' }
      })
    ]);

    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(a => ['PRESENT', 'LATE'].includes(a.status)).length;
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

    let averageGrade = 0;
    if (submissions.length > 0) {
      const total = submissions.reduce((sum, s) => sum + (s.grade || 0), 0);
      averageGrade = total / submissions.length;
    }

    return successResponse({
      student: {
        name: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
        avatar: enrollment.student.avatarUrl,
        id: enrollment.student.id.slice(0, 8),
        joinedAt: enrollment.student.createdAt
      },
      course: {
        name: enrollment.course.title,
        teacher: `${enrollment.course.teacher.firstName} ${enrollment.course.teacher.lastName}`,
        teacherAvatar: enrollment.course.teacher.avatarUrl
      },
      stats: {
        averageGrade: averageGrade.toFixed(1),
        attendancePercentage,
        assignmentCompletion: submissions.length,
        totalAssignments: totalAttendance // Use real total sessions as total assignments placeholder
      },
      metrics: {
        attendanceScore: attendancePercentage,
        assignmentScore: Math.round(averageGrade),
        participationScore: 0,
        behaviorScore: 0, // Fallback for live reports
        cefrLevel: enrollment.course.level
      },
      timeline: submissions.map(s => ({
        id: s.gradedAt?.toString(),
        title: s.assignment.title,
        date: s.gradedAt?.toISOString(),
        grade: s.grade?.toFixed(0),
        feedback: s.feedback
      })),
      comments: submissions.filter(s => s.feedback).map(s => ({
        id: s.gradedAt?.toString(),
        text: s.feedback,
        date: s.gradedAt?.toISOString(),
        teacher: s.gradedBy ? `${s.gradedBy.firstName} ${s.gradedBy.lastName}` : 'Teacher',
        avatar: s.gradedBy?.avatarUrl
      }))
    });

  } catch (error) {
    console.error('Evaluation details error:', error);
    return errors.internal('Failed to fetch evaluation details');
  }
}