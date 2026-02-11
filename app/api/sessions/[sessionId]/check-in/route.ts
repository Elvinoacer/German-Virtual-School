import { NextRequest } from 'next/server';
import { authenticate, isStudentEnrolled } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const payload = await authenticate(request);
    const { sessionId } = await params;
    const studentId = payload.id || (payload as any).userId;

    if (payload.role !== 'STUDENT' && payload.role !== 'TEACHER' && payload.role !== 'ADMIN') {
      return errors.forbidden('Only students, teachers, and admins can check in');
    }

    // Get session
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      select: { courseId: true, status: true, teacherId: true, startTime: true },
    });

    if (!session) {
      return errors.notFound('Session');
    }

    // Allow check-in if live or scheduled
    if (session.status === 'CANCELLED' || session.status === 'COMPLETED') {
      return errors.badRequest('Session is no longer active');
    }

    // Verify enrollment/teacher status
    if (payload.role === 'STUDENT') {
      // Students must be enrolled AND assigned to the session's teacher (mentor)
      const isEnrolled = await isStudentEnrolled(studentId, session.courseId);
      if (!isEnrolled) {
        return errors.forbidden('Not enrolled in this course');
      }

      // Verify student is assigned to this teacher
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: studentId },
        select: { mentorId: true }
      });
      
      if (studentProfile?.mentorId !== session.teacherId) {
        return errors.forbidden('You are not assigned to this teacher. Contact admin to be assigned.');
      }
    }
    // Teachers and Admins bypass enrollment checks

    // Determine status (PRESENT vs LATE)
    // Late threshold: 15 minutes after start time
    let status: 'PRESENT' | 'LATE' = 'PRESENT';
    const startTime = new Date(session.startTime);
    const lateThreshold = new Date(startTime.getTime() + 15 * 60000); // 15 minutes buffer
    
    if (new Date() > lateThreshold) {
      status = 'LATE';
    }

    // Create or update attendance record
    const attendance = await prisma.attendanceRecord.upsert({
      where: {
        classSessionId_studentId: {
          classSessionId: sessionId,
          studentId,
        },
      },
      create: {
        classSessionId: sessionId,
        studentId,
        status,
        checkInTime: new Date(),
        logs: {
          create: { type: 'JOIN' }
        }
      },
      update: {
        status: 'PRESENT',
        // Only update checkInTime if it was null
        checkInTime: { set: new Date() }, // In a real app we might want to keep the very first join
        logs: {
          create: { type: 'JOIN' }
        }
      },
    });

    return successResponse(attendance, 'Checked in successfully');
  } catch (error) {
    console.error('Check-in error:', error);
    return errors.internal('Failed to check in');
  }
}