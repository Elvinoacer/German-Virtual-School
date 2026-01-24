import { NextRequest } from 'next/server';
import { authenticate, isTeacherOfCourse } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { notify } from '@/lib/notifications/orchestrator';
import { NotificationType } from '@/generated/prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== 'TEACHER') {
      return errors.forbidden('Only teachers can create class sessions');
    }

    const { courseId } = await params;

    // Verify teacher owns the course
    const isOwner = await isTeacherOfCourse(payload.userId, courseId);
    if (!isOwner) {
      return errors.forbidden('You do not own this course');
    }

    const body = await request.json();
    const { title, description, startTime, endTime, meetingLink } = body;

    // Validation
    if (!title || !startTime || !endTime) {
      return errors.badRequest('Missing required fields');
    }

    const session = await prisma.classSession.create({
      data: {
        courseId,
        teacherId: payload.userId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        meetingLink,
      },
    });

    // Notify enrolled students
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, status: 'ACTIVE' },
      select: { studentId: true, student: { select: { email: true, fcmTokens: true } } }
    });

    enrollments.forEach(enrollment => {
      notify({
        userId: enrollment.studentId,
        title: `New Class Scheduled: ${title}`,
        message: `A new session has been scheduled for ${new Date(startTime).toLocaleString()}`,
        type: NotificationType.CLASS_REMINDER,
        email: { to: enrollment.student.email },
        push: { tokens: enrollment.student.fcmTokens },
        metadata: {
          link: `/student/schedule`,
          sessionId: session.id,
          courseId
        }
      });
    });

    return successResponse(session, 'Class session created successfully', 201);
  } catch (error) {
    console.error('Create session error:', error);
    return errors.internal('Failed to create class session');
  }
}
