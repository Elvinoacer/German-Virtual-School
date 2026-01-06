import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
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

    // Get attendance record
    const attendance = await prisma.attendanceRecord.findUnique({
      where: {
        classSessionId_studentId: {
          classSessionId: sessionId,
          studentId,
        },
      },
      include: {
        logs: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!attendance) {
      return successResponse({ message: 'No active attendance record found' });
    }

    // Add LEAVE log
    await prisma.attendanceLog.create({
      data: {
        attendanceRecordId: attendance.id,
        type: 'LEAVE'
      }
    });

    // Update check-out time
    const updatedRecord = await prisma.attendanceRecord.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: new Date()
      },
      include: {
        logs: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    // Calculate total duration in minutes from logs
    let totalMs = 0;
    let lastJoin: Date | null = null;

    updatedRecord.logs.forEach(log => {
      if (log.type === 'JOIN') {
        lastJoin = log.timestamp;
      } else if (log.type === 'LEAVE' && lastJoin) {
        totalMs += log.timestamp.getTime() - lastJoin.getTime();
        lastJoin = null;
      }
    });

    // If still "joined", add time until now
    if (lastJoin) {
      totalMs += new Date().getTime() - (lastJoin as any).getTime();
    }

    const durationMinutes = Math.round(totalMs / 1000 / 60);

    await prisma.attendanceRecord.update({
      where: { id: attendance.id },
      data: { durationMinutes }
    });

    return successResponse({ durationMinutes }, 'Checked out successfully');
  } catch (error) {
    console.error('Check-out error:', error);
    return errors.internal('Failed to check out');
  }
}
