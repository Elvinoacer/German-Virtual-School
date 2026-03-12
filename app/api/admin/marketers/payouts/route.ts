import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

/**
 * GET /api/admin/marketers/payouts
 * List all payouts across all marketers in a single query
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Access denied');
    }

    const payouts = await prisma.commissionPayout.findMany({
      include: {
        marketer: {
          select: { firstName: true, lastName: true, email: true },
        },
        commissions: {
          select: { studentName: true, type: true, amount: true },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    const data = payouts.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      payoutMethod: p.payoutMethod,
      transactionReference: p.transactionReference,
      note: p.note,
      paidAt: p.paidAt,
      marketerName: `${p.marketer.firstName} ${p.marketer.lastName}`,
      marketerEmail: p.marketer.email,
      studentsCovered: p.commissions.map((c) => c.studentName),
    }));

    return successResponse(data);
  } catch (error) {
    console.error('List payouts error:', error);
    return errors.internal('Failed to list payouts');
  }
}
