import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { calculateEvaluationGrade } from '@/lib/grading';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== 'STUDENT') {
      return errors.forbidden('Only students can access their grades');
    }

    const studentId = payload.userId;

    // 1. Fetch Enrolled Courses with Progress
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            level: true,
            _count: {
              select: { modules: true, assignments: true }
            }
          }
        }
      }
    });

    // 2. Fetch Graded Submissions
    const submissions = await prisma.submission.findMany({
      where: {
        studentId,
        status: { in: ['GRADED', 'RETURNED'] } // Explicitly look for graded items
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            maxPoints: true,
            dueDate: true,
            course: {
              select: { title: true }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    // 3. Fetch Evaluations
    const evaluations = await prisma.evaluation.findMany({
      where: { studentId },
      include: {
        academicTerm: { select: { name: true, startDate: true, endDate: true } },
        course: { select: { title: true } },
        teacher: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate aggregated stats
    const totalAssignments = submissions.length;
    let averageGrade = 0;
    
    if (totalAssignments > 0) {
      const totalScore = submissions.reduce((acc, sub) => {
        // Normalize grade to percentage
        const grade = sub.grade || 0;
        const max = sub.assignment.maxPoints || 100;
        return acc + ((grade / max) * 100);
      }, 0);
      averageGrade = totalScore / totalAssignments;
    }

    // Format response
    const data = {
      stats: {
        averageGrade: Math.round(averageGrade), // Overall average percentage
        assignmentsCompleted: totalAssignments,
        evaluationsReceived: evaluations.length,
        activeCourses: enrollments.length
      },
      courses: enrollments.map(e => ({
        id: e.courseId,
        title: e.course.title,
        level: e.course.level,
        progress: 0, // Fallback if progress not available on Enrollment yet
        status: e.status
      })),
      recentGrades: submissions.map(s => ({
        id: s.id,
        assignmentTitle: s.assignment.title,
        courseTitle: s.assignment.course.title,
        grade: s.grade,
        maxPoints: s.assignment.maxPoints,
        feedback: s.feedback,
        gradedAt: s.gradedAt,
        type: 'Assignment'
      })),
      evaluations: evaluations.map(e => ({
        id: e.id,
        type: e.category?.includes('Term') ? 'TERM' : 'COURSE', // Infer type from category
        title: e.category || 'Evaluation',
        teacherName: `${e.teacher.firstName} ${e.teacher.lastName}`,
        createdAt: e.createdAt,
        overallScore: e.grade || calculateEvaluationGrade(e)
      }))
    };

    return successResponse(data);

  } catch (error) {
    console.error('Get student grades error:', error);
    return errors.internal('Failed to fetch grades');
  }
}
