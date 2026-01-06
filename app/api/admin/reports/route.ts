import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Access denied');
    }

    const { searchParams } = new URL(request.url);
    const termId = searchParams.get('termId');

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    // Parallel fetch for KPIs, Academic Terms and Recent Reports
    const [
      submissions,
      attendanceRecords,
      currentMonthInvoices,
      activeSessions,
      academicTerms,
      recentReports
    ] = await Promise.all([
      // Grades for average calculation (filter by term if provided)
      prisma.submission.findMany({
        where: {
          gradedAt: { gte: subMonths(now, 1) },
          grade: { not: null },
          assignment: termId ? {
            course: {
              evaluations: {
                some: { academicTermId: termId }
              }
            }
          } : undefined
        },
        select: { grade: true }
      }),
      // Attendance for rate calculation
      prisma.attendanceRecord.findMany({
        where: {
          classSession: {
            startTime: { gte: subMonths(now, 1) },
            ...(termId ? { course: { evaluations: { some: { academicTermId: termId } } } } : {})
          },
          status: { in: ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] }
        },
        select: { status: true }
      }),
      // Revenue: Sum PAID payments in current month
      prisma.payment.findMany({
        where: {
          status: 'PAID',
          processedAt: { gte: currentMonthStart, lte: currentMonthEnd }
        },
        select: { amount: true }
      }),
      // Active Classrooms
      prisma.classSession.count({
        where: { status: 'LIVE' }
      }),
      // Fetch Academic Terms for the selector
      prisma.academicTerm.findMany({
        orderBy: { startDate: 'desc' }
      }),
      // Real Reports from the database
      prisma.systemReport.findMany({
        take: 5,
        orderBy: { generatedAt: 'desc' },
        include: {
          generatedBy: {
            select: { firstName: true, lastName: true }
          }
        }
      })
    ]);

    // Calculate Average Grade
    let averageGrade = 0;
    if (submissions.length > 0) {
      const totalGrade = submissions.reduce((sum: number, sub: { grade: number | null }) => sum + (Number(sub.grade) || 0), 0);
      averageGrade = totalGrade / submissions.length;
    }

    // Calculate Attendance Rate: (Present + Late) / (Present + Late + Absent)
    let attendanceRate = 0;
    if (attendanceRecords.length > 0) {
      const positiveCount = attendanceRecords.filter((a: { status: string }) => ['PRESENT', 'LATE'].includes(a.status)).length;
      const relevantCount = attendanceRecords.filter((a: { status: string }) => ['PRESENT', 'LATE', 'ABSENT'].includes(a.status)).length;
      attendanceRate = relevantCount > 0 ? (positiveCount / relevantCount) * 100 : 0;
    }

    // Calculate Revenue from Payments
    const totalRevenue = currentMonthInvoices.reduce((sum: number, pay: { amount: any }) => sum + Number(pay.amount), 0);

    return successResponse({
      kpis: {
        averageGrade: averageGrade.toFixed(1),
        attendanceRate: Math.round(attendanceRate),
        revenue: totalRevenue,
        activeClassrooms: activeSessions
      },
      academicTerms,
      recentReports: recentReports.map(report => ({
        id: report.id,
        name: report.name,
        type: report.type,
        date: report.generatedAt.toISOString(),
        status: report.status,
        icon: report.type === 'ACADEMIC' ? 'school' : report.type === 'FINANCIAL' ? 'payments' : 'groups',
        color: report.type === 'ACADEMIC' ? 'blue' : report.type === 'FINANCIAL' ? 'emerald' : 'purple',
        generatedBy: `${report.generatedBy.firstName} ${report.generatedBy.lastName}`
      }))
    });

  } catch (error) {
    console.error('Admin reports error:', error);
    return errors.internal('Failed to fetch reports data');
  }
}
