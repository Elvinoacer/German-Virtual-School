import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    // Ensure only admins access this
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Access denied');
    }

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Parallel fetch all data
    const [
      totalStudents,
      lastMonthStudents,
      activeTeachers,
      lastMonthTeachers,
      currentMonthPayments,
      lastMonthPayments,
      activeSessions,
      userGrowthData,
      systemSettings
    ] = await Promise.all([
      // Total Students
      prisma.user.count({
        where: { role: 'STUDENT' }
      }),
      // Last Month Students (for trend calculation)
      prisma.user.count({
        where: {
          role: 'STUDENT',
          createdAt: { lte: lastMonthEnd }
        }
      }),
      // Active Teachers
      prisma.user.count({
        where: { role: 'TEACHER' }
      }),
      // Last Month Teachers
      prisma.user.count({
        where: {
          role: 'TEACHER',
          createdAt: { lte: lastMonthEnd }
        }
      }),
      // Current Month Revenue (PAID payments)
      prisma.payment.findMany({
        where: {
          status: 'PAID',
          processedAt: {
            gte: currentMonthStart,
            lte: currentMonthEnd
          }
        },
        select: { amount: true }
      }),
      // Last Month Revenue (PAID payments)
      prisma.payment.findMany({
        where: {
          status: 'PAID',
          processedAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        },
        select: { amount: true }
      }),
      // Active/Live Sessions
      prisma.classSession.findMany({
        where: {
          status: { in: ['LIVE', 'SCHEDULED'] },
          startTime: {
            gte: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Last 2 hours
            lte: new Date(now.getTime() + 30 * 60 * 1000) // Next 30 minutes
          }
        },
        include: {
          course: {
            select: { title: true, level: true }
          },
          teacher: {
            select: { firstName: true, lastName: true }
          },
          attendance: {
            select: { id: true }
          }
        },
        orderBy: { startTime: 'asc' },
        take: 10
      }),
      // Enrollment Growth - Last 6 months
      prisma.$queryRaw<Array<{ month: Date; count: bigint }>>`
        SELECT 
          DATE_TRUNC('month', "enrolledAt") as month,
          COUNT(*)::bigint as count
        FROM "Enrollment"
        WHERE "enrolledAt" >= ${subMonths(now, 6)}
        GROUP BY DATE_TRUNC('month', "enrolledAt")
        ORDER BY month ASC
      `,
      // System Settings
      prisma.systemSettings.findFirst()
    ]);

    // Calculate Revenue
    const currentRevenue = currentMonthPayments.reduce(
      (sum, pay) => sum + Number(pay.amount),
      0
    );
    const lastRevenue = lastMonthPayments.reduce(
      (sum, pay) => sum + Number(pay.amount),
      0
    );

    // Calculate Trends
    const studentsTrend = lastMonthStudents > 0 
      ? Math.round(((totalStudents - lastMonthStudents) / lastMonthStudents) * 100)
      : 0;
    
    const teachersTrend = lastMonthTeachers > 0
      ? Math.round(((activeTeachers - lastMonthTeachers) / lastMonthTeachers) * 100)
      : 0;
    
    const revenueTrend = lastRevenue > 0
      ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
      : 0;

    // Calculate Financial Health breakdown (Real data if possible)
    // For now, using a more dynamic interpretation: 
    // totalCollected vs totalExpected
    const totalCollected = currentRevenue;
    // We can fetch total expected from invoices
    const currentMonthInvoicesData = await prisma.invoice.aggregate({
      where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } },
      _sum: { amount: true }
    });
    const totalExpected = Number(currentMonthInvoicesData._sum.amount) || currentRevenue;
    const pendingAmount = Math.max(0, totalExpected - totalCollected);
    
    const courseFeesPct = currentRevenue > 0 ? 80 : 0; // Simplified assumption
    const materialsPct = currentRevenue > 0 ? 10 : 0;
    const pendingPct = totalExpected > 0 ? Math.round((pendingAmount / totalExpected) * 100) : 0;

    // Format Enrollment Growth Data with Gap Filling
    const growthMap = new Map(userGrowthData.map(item => [format(new Date(item.month), 'MMM'), Number(item.count)]));
    const formattedGrowth = Array.from({ length: 6 }).map((_, i) => {
      const monthDate = subMonths(now, 5 - i);
      const monthLabel = format(monthDate, 'MMM');
      return {
        month: monthLabel,
        count: growthMap.get(monthLabel) || 0
      };
    });

    // Format Active Sessions
    const formattedSessions = activeSessions.map(session => ({
      id: session.id,
      className: session.course.title,
      level: session.course.level,
      teacher: `${session.teacher.firstName} ${session.teacher.lastName}`,
      studentCount: session.attendance.length,
      maxStudents: systemSettings?.maxStudentsPerClass || 25,
      status: session.status,
      latency: 24 // Default stable latency
    }));

    return successResponse({
      stats: {
        totalStudents,
        studentsTrend,
        activeTeachers,
        teachersTrend,
        monthlyRevenue: currentRevenue,
        revenueTrend,
        systemStatus: 'operational'
      },
      userGrowth: formattedGrowth,
      financialHealth: {
        total: currentRevenue,
        courseFees: courseFeesPct,
        materials: materialsPct,
        pending: pendingPct
      },
      activeSessions: formattedSessions
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    return errors.internal('Failed to fetch admin dashboard data');
  }
}
