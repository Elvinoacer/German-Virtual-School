import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string; courseId: string }> }
) {
  try {
    const user = await authenticate(request);
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      return errors.forbidden('Unauthorized');
    }

    const { studentId, courseId } = await params;

    // 1. Calculate Attendance Percentage
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        studentId,
        classSession: {
          courseId
        }
      },
      select: { status: true }
    });

    const totalSessions = attendanceRecords.length;
    const presentOrLate = attendanceRecords.filter(r => 
      r.status === 'PRESENT' || r.status === 'LATE'
    ).length;

    const attendancePercentage = totalSessions > 0 
      ? Math.round((presentOrLate / totalSessions) * 100) 
      : 100; // Default to 100 if no sessions yet? Or maybe 0? Let's go with 100 as "not penalized".

    // 2. Calculate Assignment Average (Normalized)
    const submissions = await prisma.submission.findMany({
      where: {
        studentId,
        assignment: {
          courseId
        },
        status: { in: ['GRADED', 'RETURNED'] },
        grade: { not: null }
      },
      include: {
        assignment: {
          select: { maxPoints: true }
        }
      }
    });

    let assignmentAverage = 0;
    if (submissions.length > 0) {
      const totalPercentage = submissions.reduce((acc, sub) => {
        const grade = sub.grade || 0;
        const max = sub.assignment.maxPoints || 100;
        return acc + ((grade / max) * 100);
      }, 0);
      assignmentAverage = Math.round(totalPercentage / submissions.length);
    } else {
        // If no assignments graded yet, maybe default to 80 or something neutral? 
        // Or 0? Let's use 0 to show "nothing evaluated yet".
        assignmentAverage = 0; 
    }

    return successResponse({
      attendancePercentage,
      assignmentAverage,
      totalSessions,
      gradedAssignments: submissions.length
    });

  } catch (error) {
    console.error('Error fetching student evaluation stats:', error);
    return errors.internal('Failed to fetch evaluation stats');
  }
}
