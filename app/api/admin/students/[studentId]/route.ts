import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

// GET - Fetch single student details for admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const payload = await authenticate(request);
    
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Access denied');
    }

    const { studentId } = await params;

    const student = await prisma.user.findUnique({
      where: { id: studentId, role: 'STUDENT' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        image: true,
        isVerified: true,
        onboardingComplete: true,
        createdAt: true,
        studentProfile: true,
        enrollments: {
          select: {
            id: true,
            status: true,
            enrolledAt: true,
            course: {
              select: {
                id: true,
                title: true,
                level: true,
                teacher: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  }
                }
              }
            }
          },
          orderBy: { enrolledAt: 'desc' }
        },
        invoices: {
          select: {
            id: true,
            amount: true,
            paidAmount: true,
            status: true,
            dueDate: true,
            createdAt: true,
            payments: {
              select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                processedAt: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        receivedEvaluations: {
          include: {
            course: { select: { title: true, level: true } },
            teacher: { select: { firstName: true, lastName: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!student) {
      return errors.notFound('Student not found');
    }

    // Calculate billing stats
    const totalInvoiced = student.invoices.reduce((sum: number, inv) => sum + Number(inv.amount), 0);
    const totalPaid = student.invoices.reduce((sum: number, inv) => sum + Number(inv.paidAmount), 0);
    const arrears = totalInvoiced - totalPaid;

    // Flatten payments from invoices
    const allPayments = student.invoices.flatMap(inv => inv.payments);

    return successResponse({
      ...student,
      payments: allPayments,
      studentEvaluations: student.receivedEvaluations,
      stats: {
        totalEnrollments: student.enrollments.length,
        activeEnrollments: student.enrollments.filter((e) => e.status === 'ACTIVE').length,
        totalInvoiced,
        totalPaid,
        arrears,
      }
    });

  } catch (error) {
    console.error('Admin student detail error:', error);
    return errors.internal('Failed to fetch student details');
  }
}
