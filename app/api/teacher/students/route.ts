import { NextRequest } from 'next/server';
import { authenticate, requireRole } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { CourseLevel } from '@/generated/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);

    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      return errors.forbidden('Only teachers can access student lists');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const level = searchParams.get('level'); // Optional course level filter

    const skip = (page - 1) * limit;

    const courseFilter: any = {
      teacherId: user.id,
    };

    if (level && level !== 'ALL' && Object.values(CourseLevel).includes(level as CourseLevel)) {
      courseFilter.level = level as CourseLevel;
    }

    // Build where clause
    const where: any = {
      // Find students enrolled in courses taught by this teacher
      enrollments: {
        some: {
          course: courseFilter,
        },
      },
      role: 'STUDENT',
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          avatarUrl: true,
          // lastLogin: true, // Removed as it's not in schema
          enrollments: {
            where: {
              course: {
                teacherId: user.id,
              },
            },
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  level: true,
                },
              },
            },
          },
          attendanceRecords: {
             where: {
                classSession: {
                    course: {
                        teacherId: user.id
                    }
                }
             }
          }
        },
        orderBy: { lastName: 'asc' },
      }),
      prisma.user.count({ where }),
    ]);

    // Process students to add aggregated fields like average grade or attendance
    const processedStudents = students.map(student => {
        // Calculate attendance rate
        const attendanceCount = student.attendanceRecords.filter(r => r.status === 'PRESENT').length;
        const totalRecords = student.attendanceRecords.length;
        const attendanceRate = totalRecords > 0 ? Math.round((attendanceCount / totalRecords) * 100) : 0;

        // Get progress from the relevant enrollment
        const relevantEnrollment = student.enrollments[0];
        const progress = relevantEnrollment ? relevantEnrollment.progressPercentage : 0;

        return {
            ...student,
            attendanceRate,
            progress,
            activeCourse: relevantEnrollment?.course || null
        };
    });

    return successResponse({
      data: processedStudents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get teacher students error:', error);
    return errors.internal('Failed to fetch students');
  }
}
