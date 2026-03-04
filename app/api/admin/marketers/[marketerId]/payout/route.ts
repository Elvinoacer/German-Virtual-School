import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

/**
 * POST /api/admin/marketers/[marketerId]/payout
 * Record a commission payout to a marketer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ marketerId: string }> }
) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Access denied');
    }

    const { marketerId } = await params;
    const { amount, note } = await request.json();

    if (!amount || amount <= 0) {
      return errors.badRequest('Payout amount must be greater than 0');
    }

    // Verify marketer exists
    const marketer = await prisma.marketer.findUnique({
      where: { id: marketerId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!marketer) {
      return errors.notFound('Marketer');
    }

    // Create payout and mark matching EARNED commissions as PAID
    const result = await prisma.$transaction(async (tx) => {
      // Create the payout record
      const payout = await tx.commissionPayout.create({
        data: {
          marketerId,
          amount,
          note: note || null,
        },
      });

      // Mark EARNED commissions as PAID up to the payout amount
      const earnedCommissions = await tx.referralCommission.findMany({
        where: {
          marketerId,
          status: 'EARNED',
        },
        orderBy: { createdAt: 'asc' },
      });

      let remaining = amount;
      for (const commission of earnedCommissions) {
        if (remaining <= 0) break;

        await tx.referralCommission.update({
          where: { id: commission.id },
          data: {
            status: 'PAID',
            payoutId: payout.id,
          },
        });

        remaining -= Number(commission.amount);
      }

      return payout;
    });

    return successResponse(result, `Payout of KES ${amount.toLocaleString()} recorded for ${marketer.firstName} ${marketer.lastName}`);
  } catch (error) {
    console.error('Record payout error:', error);
    return errors.internal('Failed to record payout');
  }
}
