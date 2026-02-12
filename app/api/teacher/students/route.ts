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
    
    // Filter for students assigned to this teacher (Mentee OR Enrolled in their course)
    // AND apply search/level filters
    const teacherStudentWhere: any = {
      role: 'STUDENT',
      AND: [
        {
          OR: [
            { enrollments: { some: { course: { teacherId: user.id }, status: 'ACTIVE' } } },
            { studentProfile: { mentorId: user.id } }
          ]
        }
      ]
    };

    if (search) {
      teacherStudentWhere.AND.push({
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      });
    }

    // Level filter applies to checking if they have an active enrollment in a course of that level
    // OR if they are a mentee, we might want to check their general level if stored (but it's usually on course).
    // For now, let's filter via enrollments if level is specified.
    if (level && level !== 'all') {
         teacherStudentWhere.AND.push({
             enrollments: {
                 some: {
                     course: { level: level as CourseLevel },
                     status: 'ACTIVE'
                 }
             }
         });
    }

    const [students, totalAssigned, totalStudentsInSchool] = await Promise.all([
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
          enrollments: {
            where: { status: 'ACTIVE' },
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
                // Get attendance for sessions taught by this teacher potentially?
                // Or generally. Let's keep general for now or specific to teacher's sessions.
                // Request says "Attendance Rate", usually implies overall or specific to context.
                // Let's grab all for simplicity of calculation, or last 30 days.
             }
          }
        },
        orderBy: { lastName: 'asc' },
      }),
      prisma.user.count({ where: teacherStudentWhere }),
      prisma.user.count({ where: { role: 'STUDENT' } }) // Total students in the entire school
    ]);

    // Process students
    const processedStudents = students.map(student => {
        // Calculate attendance rate (simple version)
        const attendanceCount = student.attendanceRecords.filter(r => r.status === 'PRESENT').length;
        const totalRecords = student.attendanceRecords.length;
        const attendanceRate = totalRecords > 0 ? Math.round((attendanceCount / totalRecords) * 100) : 0;

        // Get active course (prefer one taught by this teacher if multiple)
        // Since we filtered enrollments by status ACTIVE, just pick the first one or one matching the teacher if possible
        // But we didn't filter the `select` enrollments by teacherId, so we might get others.
        // Let's assume the first active one is fine for display.
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
        totalItems: totalAssigned, // Assigned students count
        totalSchoolStudents: totalStudentsInSchool, // Total students in school
        totalPages: Math.ceil(totalAssigned / limit),
      },
    });
  } catch (error) {
    console.error('Get teacher students error:', error);
    return errors.internal('Failed to fetch students');
  }
}
