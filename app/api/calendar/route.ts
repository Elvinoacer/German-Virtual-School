import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request).catch(() => null);
    const { searchParams } = new URL(request.url);
    
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    const where: any = {};

    if (startDateStr) {
      where.startTime = { ...where.startTime, gte: new Date(startDateStr) };
    }
    if (endDateStr) {
      const endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
      where.startTime = { ...where.startTime, lte: endDate };
    }

    if (payload) {
      if (payload.role === 'STUDENT') {
        const enrollments = await prisma.enrollment.findMany({
          where: { 
              studentId: payload.id,
              status: { in: ['ACTIVE', 'COMPLETED'] }
          },
          select: { courseId: true },
        });
        const courseIds = enrollments.map(e => e.courseId);
        where.courseId = { in: courseIds };
      } else if (payload.role === 'TEACHER') {
        where.teacherId = payload.id;
      }
    } else {
      // Public access: Show all sessions for published courses
      where.course = {
        status: 'PUBLISHED'
      };
    }

    const sessions = await prisma.classSession.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            level: true
          }
        },
        teacher: {
            select: {
                firstName: true,
                lastName: true
            }
        }
      },
      orderBy: { startTime: 'asc' },
    });

    return successResponse(sessions);
  } catch (error) {
    console.error('Calendar error:', error);
    return errors.internal('Failed to fetch calendar');
  }
}
