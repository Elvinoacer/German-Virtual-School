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
    const level = searchParams.get('level') || 'all';

    // Build where clause
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (level !== 'all') {
      whereClause.level = level;
    }

    // Fetch all courses with enrollment and revenue data
    const courses = await prisma.course.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        level: true,
        price: true,
        durationWeeks: true,
        createdAt: true,
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            modules: true
          }
        },
        enrollments: {
          select: {
            status: true,
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
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate summary stats per course
    const coursesWithStats = courses.map(course => {
      const activeEnrollments = course.enrollments.filter(e => e.status === 'ACTIVE').length;
      const completedEnrollments = course.enrollments.filter(e => e.status === 'COMPLETED').length;
      
      // Calculate revenue (approximate based on enrollments)
      let totalRevenue = 0;
      course.enrollments.forEach(enrollment => {
        const studentInvoices = enrollment.student.invoices;
        const paidAmount = studentInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
        totalRevenue += paidAmount / (studentInvoices.length || 1); // Rough approximation
      });

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        price: course.price,
        duration: course.durationWeeks,
        createdAt: course.createdAt,
        teacher: `${course.teacher.firstName} ${course.teacher.lastName}`,
        teacherId: course.teacher.id,
        stats: {
          totalEnrollments: course._count.enrollments,
          activeEnrollments,
          completedEnrollments,
          totalModules: course._count.modules,
          revenue: Math.round(totalRevenue),
          completionRate: course._count.enrollments > 0 
            ? Math.round((completedEnrollments / course._count.enrollments) * 100)
            : 0
        }
      };
    });

    return successResponse({
      courses: coursesWithStats,
      total: coursesWithStats.length
    });

  } catch (error) {
    console.error('Admin courses list error:', error);
    return errors.internal('Failed to fetch courses');
  }
}
