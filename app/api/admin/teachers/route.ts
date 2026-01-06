import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    // Ensure only admins access this
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Access denied');
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Build where clause
    const whereClause: any = {
      role: 'TEACHER'
    };

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Fetch teachers with course and revenue data
    const teachers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        createdCourses: {
          select: {
            id: true,
            title: true,
            level: true,
            price: true,
            _count: {
              select: {
                enrollments: true
              }
            },
            enrollments: {
              select: {
                student: {
                  select: {
                    invoices: {
                      select: {
                        amount: true,
                        paidAmount: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate summary stats per teacher
    const teachersWithStats = teachers.map(teacher => {
      const totalCourses = teacher.createdCourses.length;
      const totalStudents = teacher.createdCourses.reduce(
        (sum, course) => sum + course._count.enrollments,
        0
      );

      // Calculate revenue from all courses
      let totalRevenue = 0;
      teacher.createdCourses.forEach(course => {
        course.enrollments.forEach(enrollment => {
          const invoiceTotal = enrollment.student.invoices.reduce(
            (sum, inv) => sum + Number(inv.paidAmount),
            0
          );
          totalRevenue += invoiceTotal / totalStudents || 0; // Approximate per-course revenue
        });
      });

      return {
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        avatarUrl: teacher.avatarUrl,
        createdAt: teacher.createdAt,
        stats: {
          totalCourses,
          totalStudents,
          totalRevenue: Math.round(totalRevenue),
          activeCourses: teacher.createdCourses.filter(c => c._count.enrollments > 0).length
        },
        courses: teacher.createdCourses.map(c => ({
          id: c.id,
          title: c.title,
          level: c.level,
          price: c.price,
          enrollments: c._count.enrollments
        }))
      };
    });

    return successResponse({
      teachers: teachersWithStats,
      total: teachersWithStats.length
    });

  } catch (error) {
    console.error('Admin teachers list error:', error);
    return errors.internal('Failed to fetch teachers');
  }
}
