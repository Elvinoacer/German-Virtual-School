import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { MeetingAudience } from '@/generated/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request).catch(() => null);
    const { searchParams } = new URL(request.url);
    
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    const where: any = {};
    const meetingWhere: any = {};

    if (startDateStr) {
      where.startTime = { ...where.startTime, gte: new Date(startDateStr) };
      meetingWhere.startTime = { ...meetingWhere.startTime, gte: new Date(startDateStr) };
    }
    if (endDateStr) {
      const endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
      where.startTime = { ...where.startTime, lte: endDate };
      meetingWhere.startTime = { ...meetingWhere.startTime, lte: endDate };
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
        where.OR = [
          { courseId: { in: courseIds } },
          { courseId: null }
        ];

        // Student sees ALL_USERS, ALL_STUDENTS, and specific invites
        meetingWhere.OR = [
          { audience: MeetingAudience.ALL_USERS },
          { audience: MeetingAudience.ALL_STUDENTS },
          { audience: MeetingAudience.SPECIFIC_STUDENTS, invitees: { some: { userId: payload.id } } },
        ];
      } else if (payload.role === 'TEACHER') {
        where.teacherId = payload.id;

        // Teacher sees ALL_USERS, ALL_TEACHERS, and specific invites
        meetingWhere.OR = [
          { audience: MeetingAudience.ALL_USERS },
          { audience: MeetingAudience.ALL_TEACHERS },
          { audience: MeetingAudience.SPECIFIC_TEACHERS, invitees: { some: { userId: payload.id } } },
        ];
      }
      // Admin sees all meetings (no extra filter needed)
    } else {
      // Public access: Show all sessions for published courses, plus general sessions
      where.OR = [
        { course: { status: 'PUBLISHED' } },
        { courseId: null }
      ];
    }

    const [sessions, adminMeetings] = await Promise.all([
      prisma.classSession.findMany({
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
      }),
      // Only fetch admin meetings for authenticated users
      payload
        ? prisma.adminMeeting.findMany({
            where: meetingWhere,
            include: {
              createdBy: {
                select: { firstName: true, lastName: true },
              },
            },
            orderBy: { startTime: 'asc' },
          })
        : Promise.resolve([]),
    ]);

    // Transform admin meetings to match calendar event shape
    const meetingEvents = adminMeetings.map((m) => ({
      id: m.id,
      title: m.title,
      startTime: m.startTime,
      endTime: m.endTime,
      status: m.status,
      isAdminMeeting: true,
      course: {
        id: 'admin-meeting',
        title: 'Admin Meeting',
        level: '',
      },
      teacher: {
        firstName: m.createdBy.firstName,
        lastName: m.createdBy.lastName,
      },
    }));

    return successResponse([...sessions, ...meetingEvents]);
  } catch (error) {
    console.error('Calendar error:', error);
    return errors.internal('Failed to fetch calendar');
  }
}
