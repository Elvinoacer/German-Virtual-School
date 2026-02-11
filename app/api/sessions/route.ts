import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { ClassStatus } from '@/generated/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    const { searchParams } = new URL(request.url);
    
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};

    if (courseId) {
      where.courseId = courseId;
    }

    if (status && status !== 'ALL' && Object.values(ClassStatus).includes(status as ClassStatus)) {
      where.status = status as ClassStatus;
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }

    // If student, only show sessions for enrolled courses
    if (payload.role === 'STUDENT') {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: payload.userId },
        select: { courseId: true },
      });

      const enrolledCourseIds = enrollments.map(e => e.courseId);
      
      if (enrolledCourseIds.length === 0) {
        return successResponse([]);
      }

      where.courseId = { in: enrolledCourseIds };
    }

    const sessions = await prisma.classSession.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return successResponse(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    return errors.internal('Failed to fetch sessions');
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== 'TEACHER') {
      return errors.forbidden('Only teachers can schedule class sessions');
    }

    const body = await request.json();
    const { courseId, title, description, startTime, endTime } = body;

    if (!courseId || !title || !startTime || !endTime) {
      return errors.badRequest('Missing required fields');
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return errors.notFound('Course not found');
    }

    const session = await prisma.classSession.create({
      data: {
        courseId,
        teacherId: payload.id || (payload as any).userId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'SCHEDULED',
      },
    });

    return successResponse(session, 'Class session scheduled successfully', 201);
  } catch (error) {
    console.error('Schedule session error:', error);
    return errors.internal('Failed to schedule class session');
  }
}
