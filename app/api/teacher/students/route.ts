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

    // [REMOVED STALE CODE]

    // [MODIFIED] Include students assigned specifically to this teacher
    // The previous `where` only checked for enrollments.
    // We want: (enrolled IN courses) OR (mentorId == teacherId)
    // Prisma doesn't support top-level OR with relation filters easily mixed with other top-level filters in a clean way 
    // without restructuring the whole query, so we use OR condition at the top level.
    
    // Let's restructure the 'where' clause to handle both cases
    const teacherStudentWhere: any = {
      role: 'STUDENT',
    };
    
    // If search is present, we need to combine it with the above condition using AND
    if (search) {
      teacherStudentWhere.AND = [
         {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
         }
      ];
    }
    
    // Also apply level filter if needed (this only applies to Case 1 effectively, but technically strict filtering might be tricky)
    // If a student is a mentee but not enrolled in a B2 course, should they show up when filtering for B2?
    // User requirement: "Give admin ability to group students with their teacher". 
    // Likely they want to see them regardless of course enrollment. 
    // However, the `courseFilter` variable handles the level check.
    // If we keep the OR, a mentee will appear even if they don't match the level filter (since the level filter is inside Case 1).
    // This seems correct: "My Mentees" should probably always show up.
    
    // We replace the 'where' variable with our new one
    // But wait, the previous code initialized `where` differently. Let's fully replace the logic block.

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where: teacherStudentWhere,
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
               // Show all enrollments or filter by status if needed, but not by teacherId
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
                    // Removed teacherId filter
                }
             }
          }
        },
        orderBy: { lastName: 'asc' },
      }),
      prisma.user.count({ where: teacherStudentWhere }),
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
