import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const payload = await authenticate(request);
    const { sessionId } = await params;

    // Get session
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      select: { teacherId: true, courseId: true, title: true },
    });

    if (!session) {
      return errors.notFound('Session');
    }

    const teacherId = payload.id || (payload as any).userId;

    // Only teacher can view attendance
    if (payload.role !== 'TEACHER' && payload.role !== 'ADMIN') {
      return errors.forbidden('Not authorized to view attendance');
    }

    if (payload.role === 'TEACHER' && session.teacherId !== teacherId) {
        return errors.forbidden('Not authorized to view attendance for this session');
    }

    const attendance = await prisma.attendanceRecord.findMany({
      where: { classSessionId: sessionId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        logs: {
            orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: { checkInTime: 'asc' },
    });

    // Summary statistics
    const stats = {
        totalAttendees: attendance.length,
        averageDuration: attendance.length > 0 
            ? Math.round(attendance.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / attendance.length) 
            : 0,
        presentCount: attendance.filter(a => a.status === 'PRESENT').length,
    };

    return successResponse({ 
        sessionTitle: session.title,
        stats,
        attendance 
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return errors.internal('Failed to fetch attendance');
  }
}