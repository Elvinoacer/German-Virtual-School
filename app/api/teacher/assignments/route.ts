import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    if (payload.role !== 'TEACHER') {
      return errors.forbidden('Access denied');
    }

    const teacherId = payload.id;

    // Fetch all courses taught by this teacher
    const courses = await prisma.course.findMany({
      where: { teacherId },
      select: { id: true, title: true }
    });

    const courseIds = courses.map(c => c.id);

    // 1. Stats
    const now = new Date();
    
    // Active Assignments (due date in future)
    const activeAssignmentsCount = await prisma.assignment.count({
      where: {
        courseId: { in: courseIds },
        dueDate: { gt: now }
      }
    });

    // Pending Grading (submissions with no grade)
    const pendingGradingCount = await prisma.submission.count({
      where: {
        assignment: {
          courseId: { in: courseIds }
        },
        grade: null
      }
    });

    // Total Students (unique students enrolled in teacher's courses)
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: { in: courseIds },
        status: 'ACTIVE'
      },
      select: { studentId: true },
      distinct: ['studentId']
    });
    const totalStudentsCount = enrollments.length;

    // 2. Recent Assignments List
    const assignments = await prisma.assignment.findMany({
      where: {
        courseId: { in: courseIds }
      },
      include: {
        course: {
          select: { title: true }
        },
        submissions: {
          select: {
            id: true,
            grade: true
          }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { dueDate: 'desc' },
      take: 20 // Limit to recent 20
    });

    // Calculate progress for each assignment
    // We need total students per course to calculate percentage
    // Fetch enrollment counts per course
    const courseEnrollmentCounts = await prisma.enrollment.groupBy({
      by: ['courseId'],
      where: {
        courseId: { in: courseIds },
        status: 'ACTIVE'
      },
      _count: {
        studentId: true
      }
    });

    const enrollmentMap = new Map();
    courseEnrollmentCounts.forEach(item => {
      enrollmentMap.set(item.courseId, item._count.studentId);
    });

    const formattedAssignments = assignments.map(assignment => {
      const totalStudents = enrollmentMap.get(assignment.courseId) || 0;
      const submissionCount = assignment._count.submissions;
      const progress = totalStudents > 0 ? Math.round((submissionCount / totalStudents) * 100) : 0;
      
      return {
        id: assignment.id,
        title: assignment.title,
        courseName: assignment.course.title,
        dueDate: assignment.dueDate,
        status: assignment.dueDate > now ? 'Active' : 'Closed',
        submissions: submissionCount,
        totalStudents,
        progress,
        gradedCount: assignment.submissions.filter(s => s.grade !== null).length
      };
    });

    return successResponse({
      stats: {
        activeAssignments: activeAssignmentsCount,
        pendingGrading: pendingGradingCount,
        totalStudents: totalStudentsCount
      },
      assignments: formattedAssignments,
      courses: courses // Return simple list for dropdown
    });

  } catch (error) {
    console.error('Teacher assignments error:', error);
    return errors.internal('Failed to fetch teacher assignments');
  }
}
