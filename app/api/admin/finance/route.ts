import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    // Ensure only admins access this
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Access denied');
    }

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    // Fetch all invoices with student and term info
    const [allInvoices, monthlyInvoices] = await Promise.all([
      prisma.invoice.findMany({
        select: {
          id: true,
          amount: true,
          paidAmount: true,
          status: true,
          dueDate: true,
          createdAt: true,
          description: true,
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          term: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      }),
      prisma.invoice.findMany({
        where: {
          createdAt: {
            gte: currentMonthStart,
            lte: currentMonthEnd
          }
        },
        select: {
          amount: true,
          paidAmount: true,
          status: true
        }
      })
    ]);

    // Calculate financial stats
    const totalRevenue = monthlyInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalPaid = monthlyInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
    const totalOutstanding = totalRevenue - totalPaid;
    
    const paidInvoices = allInvoices.filter(inv => inv.status === 'PAID').length;
    const partialInvoices = allInvoices.filter(inv => inv.status === 'PARTIAL').length;
    const overdueInvoices = allInvoices.filter(inv => 
      inv.status === 'PENDING' && new Date(inv.dueDate) < now
    ).length;

    // Format invoices
    const formattedInvoices = allInvoices.map(invoice => ({
      id: invoice.id,
      amount: Number(invoice.amount),
      paidAmount: Number(invoice.paidAmount),
      status: invoice.status,
      dueDate: invoice.dueDate,
      createdAt: invoice.createdAt,
      description: invoice.description,
      student: {
        id: invoice.student.id,
        name: `${invoice.student.firstName} ${invoice.student.lastName}`,
        email: invoice.student.email
      },
      term: invoice.term?.name || null
    }));

    return successResponse({
      stats: {
        totalRevenue,
        totalPaid,
        totalOutstanding,
        collectionRate: totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0,
        paidInvoices,
        partialInvoices,
        overdueInvoices
      },
      invoices: formattedInvoices
    });

  } catch (error) {
    console.error('Admin finance error:', error);
    return errors.internal('Failed to fetch finance data');
  }
}

