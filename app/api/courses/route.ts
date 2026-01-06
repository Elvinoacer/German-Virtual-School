import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { CourseLevel, CourseStatus } from '@/generated/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const level = searchParams.get('level');
    const teacherId = searchParams.get('teacherId');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (level && level !== 'ALL' && Object.values(CourseLevel).includes(level as CourseLevel)) {
      where.level = level as CourseLevel;
    }
    
    if (teacherId) where.teacherId = teacherId;
    
    // Handle status filtering
    if (status && status !== 'ALL') {
      if (Object.values(CourseStatus).includes(status as CourseStatus)) {
        where.status = status;
      }
    } else if (!status) {
      where.status = CourseStatus.PUBLISHED; // Default to published courses
    }
    // If status is 'ALL', we don't add status to where clause, showing all courses.

    // Fetch courses and count
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ]);

    // Format response
    let enrolledCourseIds: string[] = [];
    const { auth } = await import('@/lib/auth.config');
    const session = await auth();
    
    if (session?.user?.id) {
      const userEnrollments = await prisma.enrollment.findMany({
        where: { studentId: session.user.id },
        select: { courseId: true }
      });
      enrolledCourseIds = userEnrollments.map(e => e.courseId);
    }

    const formattedCourses = courses.map((course) => ({
      ...course,
      enrollmentCount: course._count.enrollments,
      isEnrolled: enrolledCourseIds.includes(course.id),
      _count: undefined,
    }));

    return successResponse({
      data: formattedCourses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get courses error:', error);
    return errors.internal('Failed to fetch courses');
  }
}
