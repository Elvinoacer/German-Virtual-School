import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';
import { startOfDay, endOfDay, addDays, subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Default range: -7 days to +23 days (approx 30 days total)
    const startDate = startDateParam ? new Date(startDateParam) : subDays(startOfDay(new Date()), 7);
    const endDate = endDateParam ? new Date(endDateParam) : addDays(endOfDay(new Date()), 23);

    // Get student's enrolled course IDs
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: user.id,
        status: 'ACTIVE',
      },
      select: {
        courseId: true,
      },
    });

    const courseIds = enrollments.map(e => e.courseId);

    if (courseIds.length === 0) {
      return successResponse({
        sessions: [],
        stats: {
          totalSessions: 0,
          upcomingCount: 0,
          liveNowCount: 0
        }
      });
    }

    // Fetch class sessions for these courses within the range
    const sessions = await prisma.classSession.findMany({
      where: {
        courseId: { in: courseIds },
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            level: true,
          }
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
            avatarUrl: true,
          }
        },
        _count: {
          select: { attendance: true }
        }
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const now = new Date();
    const stats = {
      totalSessions: sessions.length,
      upcomingCount: sessions.filter(s => new Date(s.startTime) > now).length,
      liveNowCount: sessions.filter(s => s.status === 'LIVE' || (new Date(s.startTime) <= now && new Date(s.endTime) >= now)).length
    };

    return successResponse({
      sessions,
      stats
    });
  } catch (error: any) {
    console.error('[STUDENT_SCHEDULE_GET]', error);
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
