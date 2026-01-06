import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; resourceId: string }> }
) {
  try {
    const payload = await authenticate(request);
    const { courseId, resourceId } = await params;
    const studentId = payload.id || (payload as any).userId;

    // Get enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return errors.forbidden('You are not enrolled in this course');
    }

    const body = await request.json();
    const { isCompleted, lastPosition } = body;

    // Upsert resource progress
    const progress = await prisma.resourceProgress.upsert({
      where: {
        enrollmentId_resourceId: {
          enrollmentId: enrollment.id,
          resourceId,
        },
      },
      update: {
        ...(isCompleted !== undefined && { isCompleted, completedAt: isCompleted ? new Date() : null }),
        ...(lastPosition !== undefined && { lastPosition }),
      },
      create: {
        enrollmentId: enrollment.id,
        resourceId,
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null,
        lastPosition: lastPosition || 0,
      },
    });

    // Update overall course progress percentage
    // Calculate total resources in course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            resources: true,
          },
        },
      },
    });

    const allResources = course?.modules.flatMap(m => m.resources) || [];
    const totalResourcesCount = allResources.length;

    if (totalResourcesCount > 0) {
      const completedResourcesCount = await prisma.resourceProgress.count({
        where: {
          enrollmentId: enrollment.id,
          isCompleted: true,
          resource: {
            module: {
              courseId
            }
          }
        },
      });

      const progressPercentage = Math.round((completedResourcesCount / totalResourcesCount) * 100);

      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { progressPercentage },
      });
    }

    return successResponse(progress);
  } catch (error) {
    console.error('Update resource progress error:', error);
    return errors.internal('Failed to update progress');
  }
}
