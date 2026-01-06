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
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const now = new Date();

    // Build where clause
    const whereClause: any = {
      role: 'STUDENT'
    };

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Status Filters
    if (status === 'active') {
      whereClause.enrollments = {
        some: { 
          status: 'ACTIVE',
          course: { status: 'PUBLISHED' }
        }
      };
    } else if (status === 'overdue') {
      whereClause.invoices = {
        some: {
          OR: [
            { status: 'OVERDUE' },
            {
              AND: [
                { status: { notIn: ['PAID', 'REFUNDED'] } },
                { dueDate: { lt: now } }
              ]
            }
          ]
        }
      };
    } else if (status === 'verified') {
      whereClause.isVerified = true;
    } else if (status === 'unverified') {
      whereClause.isVerified = false;
    }

    // Fetch total count for pagination
    const totalCount = await prisma.user.count({ where: whereClause });

    // Fetch students with enrollment and invoice data
    const students = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        isVerified: true,
        createdAt: true,
        enrollments: {
          select: {
            id: true,
            status: true,
            course: {
              select: {
                id: true,
                title: true,
                level: true,
                status: true
              }
            }
          }
        },
        invoices: {
          select: {
            id: true,
            amount: true,
            paidAmount: true,
            status: true,
            dueDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Calculate summary stats per student
    const studentsWithStats = students.map(student => {
      const totalInvoiced = student.invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
      const totalPaid = student.invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
      
      // Calculate true arrears based on overdue status or past due date
      const arrears = student.invoices
        .filter(inv => 
          inv.status === 'OVERDUE' || 
          (inv.status !== 'PAID' && inv.status !== 'REFUNDED' && new Date(inv.dueDate) < now)
        )
        .reduce((sum, inv) => sum + (Number(inv.amount) - Number(inv.paidAmount)), 0);
      
      const activeEnrollments = student.enrollments.filter(e => e.status === 'ACTIVE' && e.course.status === 'PUBLISHED').length;
      const completedEnrollments = student.enrollments.filter(e => e.status === 'COMPLETED').length;

      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        avatarUrl: student.avatarUrl,
        isVerified: student.isVerified,
        createdAt: student.createdAt,
        stats: {
          activeEnrollments,
          completedEnrollments,
          totalEnrollments: student.enrollments.length,
          totalInvoiced,
          totalPaid,
          arrears,
          paymentStatus: arrears > 0 ? 'overdue' : 'paid'
        },
        courses: student.enrollments.map(e => ({
          id: e.course.id,
          title: e.course.title,
          level: e.course.level,
          status: e.status
        }))
      };
    });

    return successResponse({
      students: studentsWithStats,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });

  } catch (error) {
    console.error('Admin students list error:', error);
    return errors.internal('Failed to fetch students');
  }
}
