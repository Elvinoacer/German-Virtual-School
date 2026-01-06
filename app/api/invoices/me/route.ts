import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== 'STUDENT') {
      return errors.forbidden('Only students can view their invoices');
    }

    const invoices = await prisma.invoice.findMany({
      where: { studentId: payload.userId },
      include: {
        enrollment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: { dueDate: 'desc' },
    });

    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      course: invoice.enrollment?.course,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      status: invoice.status,
      paidAmount: invoice.paidAmount,
      createdAt: invoice.createdAt,
      payments: invoice.payments,
    }));

    return successResponse({ invoices: formattedInvoices });
  } catch (error) {
    console.error('Get invoices error:', error);
    return errors.internal('Failed to fetch invoices');
  }
}
