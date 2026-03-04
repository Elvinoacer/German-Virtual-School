import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { hashPassword } from '@/lib/auth';

/**
 * GET /api/admin/marketers
 * List all marketers with aggregated stats
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Access denied');
    }

    const marketers = await prisma.marketer.findMany({
      include: {
        _count: {
          select: {
            seatReservations: true,
            commissions: true,
            payouts: true,
          },
        },
        commissions: {
          select: { amount: true, status: true, type: true },
        },
        payouts: {
          select: { amount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = marketers.map((m) => {
      const totalEarned = m.commissions.reduce((s, c) => s + Number(c.amount), 0);
      const totalPaid = m.payouts.reduce((s, p) => s + Number(p.amount), 0);
      const paidReservations = m.commissions.filter(c => c.type === 'RESERVATION').length;
      const fullPayments = m.commissions.filter(c => c.type === 'FULL_PAYMENT').length;

      return {
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        phone: m.phone,
        referralCode: m.referralCode,
        totalClicks: m.totalClicks,
        isActive: m.isActive,
        createdAt: m.createdAt,
        totalStudents: m._count.seatReservations,
        paidReservations,
        fullPayments,
        totalCommissionEarned: totalEarned,
        totalCommissionPaid: totalPaid,
        outstandingCommission: totalEarned - totalPaid,
      };
    });

    // Aggregate totals for admin overview
    const totalRevenue = data.reduce((s, m) => s + m.totalCommissionEarned, 0);
    const totalPaid = data.reduce((s, m) => s + m.totalCommissionPaid, 0);
    const totalOutstanding = data.reduce((s, m) => s + m.outstandingCommission, 0);
    const totalStudents = data.reduce((s, m) => s + m.totalStudents, 0);

    return successResponse({
      marketers: data,
      totals: {
        totalMarketers: data.length,
        totalStudentsReferred: totalStudents,
        totalCommissionEarned: totalRevenue,
        totalCommissionPaid: totalPaid,
        totalOutstanding,
      },
    });
  } catch (error) {
    console.error('List marketers error:', error);
    return errors.internal('Failed to list marketers');
  }
}

/**
 * POST /api/admin/marketers
 * Create a new marketer
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Access denied');
    }

    const { firstName, lastName, email, phone, referralCode, password } = await request.json();

    if (!firstName || !lastName || !email || !referralCode || !password) {
      return errors.badRequest('First name, last name, email, referral code, and password are required');
    }

    // Check uniqueness
    const existingEmail = await prisma.marketer.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingEmail) {
      return errors.conflict('A marketer with this email already exists');
    }

    const existingCode = await prisma.marketer.findUnique({ where: { referralCode: referralCode.trim().toUpperCase() } });
    if (existingCode) {
      return errors.conflict('This referral code is already in use');
    }

    const passwordHash = await hashPassword(password);

    const marketer = await prisma.marketer.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        referralCode: referralCode.trim().toUpperCase(),
        passwordHash,
      },
    });

    return successResponse(
      {
        id: marketer.id,
        firstName: marketer.firstName,
        lastName: marketer.lastName,
        email: marketer.email,
        referralCode: marketer.referralCode,
      },
      'Marketer created successfully',
      201
    );
  } catch (error) {
    console.error('Create marketer error:', error);
    return errors.internal('Failed to create marketer');
  }
}
