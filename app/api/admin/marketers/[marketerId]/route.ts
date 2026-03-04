import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

/**
 * GET /api/admin/marketers/[marketerId]
 * Get detailed marketer info with all referred students and commissions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marketerId: string }> }
) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Access denied');
    }

    const { marketerId } = await params;

    const marketer = await prisma.marketer.findUnique({
      where: { id: marketerId },
      include: {
        seatReservations: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            program: true,
            status: true,
            amount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        commissions: {
          orderBy: { createdAt: 'desc' },
        },
        payouts: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    if (!marketer) {
      return errors.notFound('Marketer');
    }

    return successResponse(marketer);
  } catch (error) {
    console.error('Get marketer error:', error);
    return errors.internal('Failed to get marketer');
  }
}

/**
 * PATCH /api/admin/marketers/[marketerId]
 * Update marketer details (toggle active, change info)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ marketerId: string }> }
) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Access denied');
    }

    const { marketerId } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.firstName !== undefined) updateData.firstName = body.firstName.trim();
    if (body.lastName !== undefined) updateData.lastName = body.lastName.trim();
    if (body.phone !== undefined) updateData.phone = body.phone?.trim() || null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const marketer = await prisma.marketer.update({
      where: { id: marketerId },
      data: updateData,
    });

    return successResponse({
      id: marketer.id,
      firstName: marketer.firstName,
      lastName: marketer.lastName,
      email: marketer.email,
      referralCode: marketer.referralCode,
      isActive: marketer.isActive,
    }, 'Marketer updated');
  } catch (error) {
    console.error('Update marketer error:', error);
    return errors.internal('Failed to update marketer');
  }
}
