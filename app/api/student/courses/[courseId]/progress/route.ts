import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const payload = await authenticate(request);
    const { courseId } = await params;
    const studentId = payload.id || (payload as any).userId;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
      include: {
        moduleProgress: true,
        resourceProgress: true,
      }
    });

    if (!enrollment) {
      return errors.forbidden('You are not enrolled in this course');
    }

    return successResponse(enrollment);
  } catch (error) {
    console.error('Get course progress error:', error);
    return errors.internal('Failed to fetch course progress');
  }
}
