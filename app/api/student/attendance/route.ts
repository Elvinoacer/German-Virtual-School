import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    if (payload.role !== 'STUDENT') {
      return errors.forbidden('Student access only');
    }

    const studentId = payload.id || (payload as any).userId;

    // Get all attendance records for the student with session details
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { studentId },
      include: {
        classSession: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            status: true,
            course: {
              select: {
                id: true,
                title: true,
                level: true
              }
            }
          }
        },
        logs: {
          orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: { classSession: { startTime: 'desc' } }
    });

    // Calculate attendance % for each record
    const enhancedRecords = attendanceRecords.map(record => {
      const session = record.classSession;
      const sessionDurationMs = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
      const sessionDurationMinutes = Math.round(sessionDurationMs / 60000);
      
      const attendancePercent = sessionDurationMinutes > 0 
        ? Math.min(100, Math.round(((record.durationMinutes || 0) / sessionDurationMinutes) * 100))
        : 0;

      // Determine category
      let category: 'FULL' | 'PARTIAL' | 'MISSING' = 'MISSING';
      if (record.durationMinutes && record.durationMinutes > 0) {
        if (attendancePercent >= 80) category = 'FULL';
        else if (attendancePercent >= 30) category = 'PARTIAL';
      }

      return {
        id: record.id,
        date: session.startTime,
        course: {
          id: session.course.id,
          title: session.course.title,
          level: session.course.level
        },
        session: {
          id: session.id,
          title: session.title,
          status: session.status
        },
        status: record.status,
        durationMinutes: record.durationMinutes || 0,
        sessionDurationMinutes,
        attendancePercent,
        category,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        logs: record.logs
      };
    });

    // Calculate overall statistics
    const totalSessions = enhancedRecords.length;
    const fullAttendance = enhancedRecords.filter(r => r.category === 'FULL').length;
    const partialAttendance = enhancedRecords.filter(r => r.category === 'PARTIAL').length;
    const missing = enhancedRecords.filter(r => r.category === 'MISSING').length;
    const averagePercent = totalSessions > 0
      ? Math.round(enhancedRecords.reduce((sum, r) => sum + r.attendancePercent, 0) / totalSessions)
      : 0;
    const totalMinutesAttended = enhancedRecords.reduce((sum, r) => sum + r.durationMinutes, 0);

    const stats = {
      totalSessions,
      fullAttendance,
      partialAttendance,
      missing,
      averagePercent,
      totalMinutesAttended
    };

    return successResponse({
      stats,
      records: enhancedRecords
    });

  } catch (error) {
    console.error('[STUDENT_ATTENDANCE_ERROR]', error);
    return errors.internal('Failed to fetch attendance history');
  }
}
