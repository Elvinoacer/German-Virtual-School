import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            teacherProfile: {
              select: {
                bio: true,
                specialization: true,
              },
            },
          },
        },
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            resources: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return errors.notFound('Course');
    }

    const formattedCourse: any = {
      ...course,
      teacher: {
        ...course.teacher,
        profile: course.teacher.teacherProfile,
        teacherProfile: undefined,
      },
      enrollmentCount: course._count.enrollments,
      _count: undefined,
    };

    // Check enrollment if user is logged in
    const { auth } = await import('@/lib/auth.config');
    const session = await auth();
    if (session?.user?.id) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId,
          },
        },
      });
      formattedCourse.isEnrolled = !!enrollment;
      formattedCourse.enrollmentStatus = enrollment?.status || null;

      if (enrollment) {
        const unpaidInvoice = await prisma.invoice.findFirst({
          where: {
            studentId: session.user.id,
            enrollmentId: enrollment.id,
            status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] }
          },
          orderBy: { dueDate: 'asc' }
        });
        
        if (unpaidInvoice) {
          formattedCourse.unpaidInvoice = {
            id: unpaidInvoice.id,
            amount: Number(unpaidInvoice.amount) - Number(unpaidInvoice.paidAmount),
            dueDate: unpaidInvoice.dueDate
          };
        }
      }
    }

    // Security: If not enrolled, strip resource URLs to prevent unauthorized access to materials
    if (!formattedCourse.isEnrolled) {
      formattedCourse.modules = formattedCourse.modules.map((module: any) => ({
        ...module,
        resources: module.resources.map((resource: any) => ({
          ...resource,
          url: "", // Strip sensitive URL
        })),
      }));
    }

    return successResponse(formattedCourse);
  } catch (error) {
    console.error('Get course error:', error);
    return errors.internal('Failed to fetch course');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const { authenticate } = await import('@/lib/auth-middleware');
    const payload = await authenticate(request);

    if (payload.role !== 'TEACHER') {
      return errors.forbidden('Only teachers can update courses');
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return errors.notFound('Course');
    }

    if (course.teacherId !== payload.id) {
      return errors.forbidden('You can only update your own courses');
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      level, 
      language, 
      thumbnailUrl, 
      price, 
      durationWeeks,
      outcomes,
      modules 
    } = body;

    // Update course with nested modules and resources
    // For simplicity in this update, we'll delete existing modules and recreate them if provided
    // In a production app, you'd likely want to sync them more carefully
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        level: level as CourseLevel,
        language,
        thumbnailUrl,
        price,
        durationWeeks,
        outcomes,
        ...(modules && {
          modules: {
            deleteMany: {},
            create: modules.map((module: any, mIndex: number) => ({
              title: module.title,
              description: module.description,
              orderIndex: mIndex,
              resources: {
                create: module.lessons?.map((lesson: any) => ({
                  title: lesson.title,
                  description: lesson.description,
                  type: lesson.type,
                  url: lesson.url || '',
                }))
              }
            }))
          }
        })
      },
      include: {
        modules: {
          include: {
            resources: true
          }
        }
      }
    });

    return successResponse(updatedCourse, 'Course updated successfully');
  } catch (error) {
    console.error('Update course error:', error);
    return errors.internal('Failed to update course');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const { authenticate } = await import('@/lib/auth-middleware');
    const payload = await authenticate(request);

    if (payload.role !== 'TEACHER') {
      return errors.forbidden('Only teachers can delete courses');
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return errors.notFound('Course');
    }

    if (course.teacherId !== payload.id) {
      return errors.forbidden('You can only delete your own courses');
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return successResponse(null, 'Course deleted successfully');
  } catch (error) {
    console.error('Delete course error:', error);
    return errors.internal('Failed to delete course');
  }
}

import { CourseLevel } from '@/generated/prisma/client';
