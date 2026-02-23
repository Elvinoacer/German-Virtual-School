import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { ClassStatus, NotificationType } from '@/generated/prisma/client';
import { notify } from '@/lib/notifications/orchestrator';

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

      // Also include general sessions (courseId = null)
      where.OR = [
        { courseId: { in: enrolledCourseIds } },
        { courseId: null }
      ];
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

    if (!title || !startTime || !endTime) {
      return errors.badRequest('Missing required fields');
    }

    // Verify course exists if courseId is provided
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return errors.notFound('Course not found');
      }
    }

    const session = await prisma.classSession.create({
      data: {
        courseId: courseId || null,
        teacherId: payload.id || (payload as any).userId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'SCHEDULED',
      },
      include: {
        teacher: { select: { firstName: true, lastName: true } }
      }
    });

    // --- NOTIFICATION LOGIC ---
    const sessionTeacherId = payload.id || (payload as any).userId;
    const notificationPromises: Promise<any>[] = [];

    // 1. Notify Assigned Students (Mentees)
    let studentEnrollments: any[] = [];
    if (courseId) {
       // Course-specific session: Must be enrolled AND mentored by the creator
       studentEnrollments = await prisma.enrollment.findMany({
          where: { 
             courseId,
             status: 'ACTIVE',
             student: {
                studentProfile: { mentorId: sessionTeacherId }
             }
          },
          select: { studentId: true, student: { select: { email: true, fcmTokens: true } } }
       });
    } else {
       // General session: Just needs to be mentored by the creator
       const profiles = await prisma.studentProfile.findMany({
          where: { mentorId: sessionTeacherId },
          select: { userId: true, user: { select: { email: true, fcmTokens: true } } }
       });
       
       studentEnrollments = profiles.map(p => ({
          studentId: p.userId,
          student: p.user
       }));
    }

    const sessionStartTime = new Date(startTime).toLocaleString(undefined, {
       weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    studentEnrollments.forEach(enrollment => {
       notificationPromises.push(
          notify({
             userId: enrollment.studentId,
             title: `New Class Scheduled: ${title}`,
             message: `Your teacher, ${session.teacher.firstName} ${session.teacher.lastName}, has scheduled a new session for ${sessionStartTime}.`,
             type: NotificationType.CLASS_REMINDER,
             email: { to: enrollment.student.email },
             push: { tokens: enrollment.student.fcmTokens },
             metadata: {
                link: `/student/dashboard`,
                sessionId: session.id,
                courseId: courseId || undefined
             }
          })
       );
    });

    // 2. Notify Other Teachers
    const otherTeachers = await prisma.user.findMany({
       where: { 
          role: 'TEACHER',
          id: { not: sessionTeacherId }
       },
       select: { id: true, email: true, fcmTokens: true }
    });

    otherTeachers.forEach(teacher => {
       notificationPromises.push(
          notify({
             userId: teacher.id,
             title: `New Class Session Created`,
             message: `${session.teacher.firstName} ${session.teacher.lastName} scheduled a new session: "${title}" for ${sessionStartTime}.`,
             type: NotificationType.CLASS_REMINDER,
             email: { to: teacher.email },
             push: { tokens: teacher.fcmTokens },
             metadata: {
                link: `/teacher/calendar`,
                sessionId: session.id,
                courseId: courseId || undefined
             }
          })
       );
    });

    // Fire notifications asynchronously without blocking the response
    Promise.allSettled(notificationPromises).catch(console.error);
    // --------------------------

    return successResponse(session, 'Class session scheduled successfully', 201);
  } catch (error) {
    console.error('Schedule session error:', error);
    return errors.internal('Failed to schedule class session');
  }
}
