import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const payload = await authenticate(request);
    const { assignmentId } = await params;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        submissions: payload.role === 'STUDENT' ? {
          where: { studentId: payload.id },
        } : undefined,
      },
    });

    if (!assignment) {
      return errors.notFound('Assignment not found');
    }

    // Check access rights
    if (payload.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: payload.id,
            courseId: assignment.courseId,
          },
        },
      });

      if (!enrollment) {
        return errors.forbidden('You are not enrolled in this course');
      }
    } else if (payload.role === 'TEACHER') {
      // Teachers can access assignments for courses they teach
      // For now, assuming teachers can see all assignments or we check course ownership
      // Ideally: check if teacherId matches course.teacherId
      const course = await prisma.course.findUnique({
        where: { id: assignment.courseId },
        select: { teacherId: true }
      });
      
      if (course?.teacherId !== payload.id) {
         return errors.forbidden('Access denied');
      }
    }

    return successResponse(assignment);
  } catch (error) {
    console.error('Get assignment details error:', error);
    return errors.internal('Failed to fetch assignment details');
  }
}
