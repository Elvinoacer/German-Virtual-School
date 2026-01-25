import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

/**
 * GET /api/student/billing/access
 * 
 * Check if the student has access based on billing status.
 * Returns { hasAccess: boolean, reason?: string, invoiceId?: string }
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    if (payload.role !== 'STUDENT') {
      return successResponse({ hasAccess: true }); // Non-students always have access
    }

    const studentId = payload.id || (payload as any).userId;

    // Get billing settings
    const billingSettings = await prisma.globalBillingSettings.findFirst();

    // If no settings or lateFeeAction is not BLOCK_ACCESS, allow access
    if (!billingSettings || billingSettings.lateFeeAction !== 'BLOCK_ACCESS') {
      return successResponse({ hasAccess: true });
    }

    // Check for overdue invoices
    const now = new Date();
    const overdueInvoice = await prisma.invoice.findFirst({
      where: {
        studentId,
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { lt: now }
      },
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        amount: true,
        paidAmount: true,
        dueDate: true,
        description: true
      }
    });

    if (overdueInvoice) {
      const outstanding = Number(overdueInvoice.amount) - Number(overdueInvoice.paidAmount);
      return successResponse({
        hasAccess: false,
        reason: 'OVERDUE_PAYMENT',
        invoiceId: overdueInvoice.id,
        amount: outstanding,
        description: overdueInvoice.description,
        dueDate: overdueInvoice.dueDate
      });
    }

    return successResponse({ hasAccess: true });

  } catch (error) {
    console.error('Billing access check error:', error);
    // On error, default to allowing access to avoid blocking legitimate users
    return successResponse({ hasAccess: true });
  }
}
