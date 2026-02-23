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

    // Get session with start/end times for duration calculation
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      select: { teacherId: true, courseId: true, title: true, startTime: true, endTime: true },
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

    // Lazy ABSENT marking:
    // If session is over, ensure all enrolled students have an attendance record (at least ABSENT)
    const now = new Date();
    // Use a 30 min buffer after end time before marking absent to be safe
    const isSessionEnded = session.endTime < now;
    
    if (isSessionEnded && session.courseId) {
       // 1. Get all enrolled students
       const enrollments = await prisma.enrollment.findMany({
          where: { 
            courseId: session.courseId,
            status: 'ACTIVE'
          },
          select: { studentId: true }
       });
       
       const enrolledStudentIds = enrollments.map(e => e.studentId);
       
       // 2. Get existing records
       const existingRecords = await prisma.attendanceRecord.findMany({
          where: { 
             classSessionId: sessionId 
          },
          select: { studentId: true }
       });
       
       const existingStudentIds = new Set(existingRecords.map(r => r.studentId));
       
       // 3. Identify missing students
       const missingStudentIds = enrolledStudentIds.filter(id => !existingStudentIds.has(id));
       
       // 4. Create ABSENT records
       if (missingStudentIds.length > 0) {
          await prisma.attendanceRecord.createMany({
             data: missingStudentIds.map(studentId => ({
                classSessionId: sessionId,
                studentId,
                status: 'ABSENT',
                checkInTime: null,
                checkOutTime: null,
                durationMinutes: 0
             })),
             skipDuplicates: true
          });
       }
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

    // Calculate session duration in minutes
    const sessionDurationMs = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
    const sessionDurationMinutes = Math.round(sessionDurationMs / 60000);

    // Helper function to determine attendance category
    const determineCategory = (durationMinutes: number | null, sessionDuration: number): 'FULL' | 'PARTIAL' | 'MISSING' => {
      if (!durationMinutes || durationMinutes === 0) return 'MISSING';
      const percent = (durationMinutes / sessionDuration) * 100;
      if (percent >= 80) return 'FULL';
      if (percent >= 30) return 'PARTIAL';
      return 'MISSING';
    };

    // Enhance attendance records with percentage and category
    const enhancedAttendance = attendance.map(a => ({
      ...a,
      attendancePercent: sessionDurationMinutes > 0 
        ? Math.min(100, Math.round(((a.durationMinutes || 0) / sessionDurationMinutes) * 100))
        : 0,
      category: determineCategory(a.durationMinutes, sessionDurationMinutes)
    }));

    // Summary statistics
    const stats = {
        totalEnrolled: enhancedAttendance.length,
        sessionDurationMinutes,
        averageDuration: enhancedAttendance.length > 0 
            ? Math.round(enhancedAttendance.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / enhancedAttendance.length) 
            : 0,
        averageAttendancePercent: enhancedAttendance.length > 0
            ? Math.round(enhancedAttendance.reduce((sum, a) => sum + a.attendancePercent, 0) / enhancedAttendance.length)
            : 0,
        fullAttendance: enhancedAttendance.filter(a => a.category === 'FULL').length,
        partialAttendance: enhancedAttendance.filter(a => a.category === 'PARTIAL').length,
        missing: enhancedAttendance.filter(a => a.category === 'MISSING').length,
    };

    return successResponse({ 
        sessionTitle: session.title,
        sessionDurationMinutes,
        stats,
        attendance: enhancedAttendance 
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return errors.internal('Failed to fetch attendance');
  }
}