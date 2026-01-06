import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== 'TEACHER') {
      return errors.forbidden('Only teachers can access analytics');
    }

    // Get teacher's courses
    const courses = await prisma.course.findMany({
      where: { teacherId: payload.userId },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    const activeCourses = courses.filter(c => c.status === 'PUBLISHED').length;
    const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);

    // Pending grading
    const assignments = await prisma.assignment.findMany({
      where: {
        course: {
          teacherId: payload.userId,
        },
      },
      select: { id: true },
    });

    const assignmentIds = assignments.map(a => a.id);

    const pendingSubmissions = await prisma.submission.count({
      where: {
        assignmentId: { in: assignmentIds },
        status: { in: ['SUBMITTED', 'LATE'] },
      },
    });

    // Revenue calculation (simplified)
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          teacherId: payload.userId,
        },
      },
      include: {
        course: {
          select: {
            price: true,
          },
        },
      },
    });

    const totalRevenue = enrollments.reduce(
      (sum, e) => sum + Number(e.course.price),
      0
    );

    // Get current month's revenue
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyEnrollments = enrollments.filter(
      e => new Date(e.enrolledAt) >= currentMonth
    );

    const monthlyRevenue = monthlyEnrollments.reduce(
      (sum, e) => sum + Number(e.course.price),
      0
    );

    // Engagement stats (last 7 days)
    const engagement: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const sessions = await prisma.classSession.findMany({
        where: {
          course: {
            teacherId: payload.userId,
          },
          startTime: {
            gte: date,
            lt: nextDate,
          },
        },
        select: { id: true },
      });

      const sessionIds = sessions.map(s => s.id);

      const totalAttendance = await prisma.attendanceRecord.count({
        where: {
          classSessionId: { in: sessionIds },
        },
      });

      const presentAttendance = await prisma.attendanceRecord.count({
        where: {
          classSessionId: { in: sessionIds },
          status: 'PRESENT',
        },
      });

      engagement.push({
        date: date.toISOString().split('T')[0],
        attendanceRate: totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0,
        participationRate: totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0,
      });
    }

    return successResponse({
      totalStudents,
      activeCourses,
      pendingGrading: pendingSubmissions,
      revenue: {
        monthly: monthlyRevenue,
        total: totalRevenue,
      },
      engagement,
    });
  } catch (error) {
    console.error('Get teacher analytics error:', error);
    return errors.internal('Failed to fetch analytics');
  }
}
