import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

/**
 * POST /api/sessions/[sessionId]/engagement
 * Tracks engagement events like dominant speaker changes
 * Used for teacher evaluations and participation metrics
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const payload = await authenticate(request);
    const { sessionId } = await params;
    const studentId = payload.id || (payload as any).userId;

    const body = await request.json();
    const { type, timestamp } = body;

    // Validate type
    if (!type || !['DOMINANT_SPEAKER', 'HAND_RAISED'].includes(type)) {
      return errors.badRequest('Invalid engagement type');
    }

    // Get attendance record
    const attendance = await prisma.attendanceRecord.findUnique({
      where: {
        classSessionId_studentId: {
          classSessionId: sessionId,
          studentId,
        },
      },
    });

    if (!attendance) {
      // If no attendance record, skip silently - engagement is supplementary
      return successResponse({ tracked: false }, 'No attendance record found');
    }

    // Create engagement log
    await prisma.attendanceLog.create({
      data: {
        attendanceRecordId: attendance.id,
        type: `ENGAGEMENT_${type}`,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    // Increment engagement duration (approximate - counts each speaker change as 30 seconds of speaking)
    if (type === 'DOMINANT_SPEAKER') {
      await prisma.attendanceRecord.update({
        where: { id: attendance.id },
        data: {
          // Increment engagement by 30 seconds per dominant speaker event
          // This is an approximation - real tracking would need speaker duration
          notes: attendance.notes 
            ? `${attendance.notes}|${type}:${timestamp}`
            : `${type}:${timestamp}`,
        },
      });
    }

    return successResponse({ tracked: true }, 'Engagement logged');
  } catch (error) {
    console.error('Engagement tracking error:', error);
    // Return success to avoid breaking the Jitsi experience
    return successResponse({ tracked: false }, 'Engagement tracking skipped');
  }
}
