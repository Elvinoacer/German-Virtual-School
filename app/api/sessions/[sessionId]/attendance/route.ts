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
      select: { teacherId: true, courseId: true, title: true, endTime: true },
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
    
    if (isSessionEnded) {
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