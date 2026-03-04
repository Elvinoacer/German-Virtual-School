import { NextRequest, NextResponse } from 'next/server';
import { authenticateMarketer } from '@/lib/marketer-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const marketer = await authenticateMarketer(request);

    // Fetch all data in parallel
    const [commissions, payouts, reservations, marketerRecord] = await Promise.all([
      prisma.referralCommission.findMany({
        where: { marketerId: marketer.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.commissionPayout.findMany({
        where: { marketerId: marketer.id },
        include: {
          commissions: {
            select: { studentName: true, type: true, amount: true },
          },
        },
        orderBy: { paidAt: 'desc' },
      }),
      prisma.seatReservation.findMany({
        where: { marketerId: marketer.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          program: true,
          status: true,
          amount: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.marketer.findUnique({
        where: { id: marketer.id },
        select: { totalClicks: true },
      }),
    ]);

    // Calculate stats
    const reservationCommissions = commissions.filter(c => c.type === 'RESERVATION');
    const fullPaymentCommissions = commissions.filter(c => c.type === 'FULL_PAYMENT');
    const totalEarned = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
    const totalPaid = payouts.reduce((sum, p) => sum + Number(p.amount), 0);

    const paidReservations = reservations.filter(r => r.status === 'PAID');
    
    const totalClicks = marketerRecord?.totalClicks || 0;
    const conversionRate = totalClicks > 0 ? (reservations.length / totalClicks) * 100 : 0;

    // Build student breakdown
    const studentMap = new Map<string, {
      name: string;
      email: string;
      reservationPaid: boolean;
      fullFeePaid: boolean;
      status: string;
      commission: number;
    }>();

    for (const res of reservations) {
      const key = res.email;
      const reservationCommission = reservationCommissions.find(c => c.studentEmail === res.email);
      const fullCommission = fullPaymentCommissions.find(c => c.studentEmail === res.email);

      let status = 'Lead';
      if (res.status === 'PAID' && fullCommission) {
        status = 'Full Payment Complete';
      } else if (res.status === 'PAID') {
        status = 'Reservation Paid';
      }

      studentMap.set(key, {
        name: `${res.firstName} ${res.lastName}`,
        email: res.email,
        reservationPaid: res.status === 'PAID',
        fullFeePaid: !!fullCommission,
        status,
        commission: (reservationCommission ? Number(reservationCommission.amount) : 0) +
                    (fullCommission ? Number(fullCommission.amount) : 0),
      });
    }

    // Get referral URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://germanvirtualschool.com';
    const referralUrl = `${appUrl}/reserve-seat?ref=${marketer.referralCode}`;

    return NextResponse.json({
      success: true,
      data: {
        marketer: {
          id: marketer.id,
          firstName: marketer.firstName,
          lastName: marketer.lastName,
          email: marketer.email,
          referralCode: marketer.referralCode,
          referralUrl,
        },
        stats: {
          totalStudentsReferred: reservations.length,
          totalReservationsPaid: paidReservations.length,
          totalFullPayments: fullPaymentCommissions.length,
          reservationCommissionsCount: reservationCommissions.length,
          fullPaymentCommissionsCount: fullPaymentCommissions.length,
          totalCommissionEarned: totalEarned,
          totalCommissionPaid: totalPaid,
          outstandingBalance: totalEarned - totalPaid,
          totalClicks,
          conversionRate,
        },
        students: Array.from(studentMap.values()),
        commissions: {
          reservation: {
            count: reservationCommissions.length,
            ratePerStudent: reservationCommissions.length > 0 ? Number(reservationCommissions[0].amount) : 500,
            total: reservationCommissions.reduce((s, c) => s + Number(c.amount), 0),
          },
          fullPayment: {
            count: fullPaymentCommissions.length,
            ratePerStudent: fullPaymentCommissions.length > 0 ? Number(fullPaymentCommissions[0].amount) : 1500,
            total: fullPaymentCommissions.reduce((s, c) => s + Number(c.amount), 0),
          },
          totalEarned,
        },
        payouts: payouts.map(p => ({
          id: p.id,
          amount: Number(p.amount),
          note: p.note,
          paidAt: p.paidAt,
          studentsCovered: p.commissions.map(c => c.studentName),
        })),
      },
    });
  } catch (error: any) {
    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('Marketer dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
