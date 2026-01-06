import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    console.log('GET /api/enrollments/me - User:', payload.id || (payload as any).userId);

    if (payload.role !== 'STUDENT') {
      return errors.forbidden('Only students can view their enrollments');
    }

    const studentId = payload.id || (payload as any).userId;

    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
      },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        resourceProgress: {
          select: {
            lastPosition: true,
          }
        }
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const enhancedEnrollments = enrollments.map(enrollment => {
      const totalTimeSeconds = enrollment.resourceProgress.reduce((sum, prog) => sum + (prog.lastPosition || 0), 0);
      return {
        ...enrollment,
        totalTimeSeconds
      };
    });

    return successResponse({ enrollments: enhancedEnrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    return errors.internal('Failed to fetch enrollments');
  }
}
