import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit';

const SETTINGS_ID = 'system-settings';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') return errors.forbidden('Access denied');

    let settings = await prisma.systemSettings.findUnique({
      where: { id: SETTINGS_ID }
    });

    if (!settings) {
      // Seed default settings if they don't exist
      settings = await prisma.systemSettings.create({
        data: {
          id: SETTINGS_ID,
          systemName: 'German Virtual School',
          supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@germanvirtualschool.com',
          maxStudentsPerClass: 25,
          defaultCurrency: 'USD',
          notifications: {
            emailNotifications: true,
            paymentReminders: true,
            sessionReminders: true
          },
          integrations: {
            jitsiDomain: 'meet.jit.si',
            intasendPublicKey: ''
          }
        }
      });
    }

    return successResponse(settings);
  } catch (error) {
    console.error('Fetch settings error:', error);
    return errors.internal('Failed to fetch system settings');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') return errors.forbidden('Access denied');

    const body = await request.json();
    
    // Helper to parse date strings to Date objects or null
    const parseDate = (dateStr: string | null | undefined): Date | null => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    };
    
    const settings = await prisma.systemSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {
        systemName: body.systemName,
        supportEmail: body.supportEmail,
        maxStudentsPerClass: body.maxStudentsPerClass,
        defaultCurrency: body.defaultCurrency,
        notifications: body.notifications,
        integrations: body.integrations,
        // School Calendar Fields
        enrollmentStartDate: body.enrollmentStartDate !== undefined ? parseDate(body.enrollmentStartDate) : undefined,
        enrollmentEndDate: body.enrollmentEndDate !== undefined ? parseDate(body.enrollmentEndDate) : undefined,
        orientationDate: body.orientationDate !== undefined ? parseDate(body.orientationDate) : undefined,
        firstClassDate: body.firstClassDate !== undefined ? parseDate(body.firstClassDate) : undefined,
        lastClassDate: body.lastClassDate !== undefined ? parseDate(body.lastClassDate) : undefined,
        // Seat Reservation & Material Fee Fields
        seatReservationFee: body.seatReservationFee !== undefined ? (body.seatReservationFee ? Number(body.seatReservationFee) : null) : undefined,
        materialFee: body.materialFee !== undefined ? (body.materialFee ? Number(body.materialFee) : null) : undefined,
        materialFeeDeadline: body.materialFeeDeadline !== undefined ? parseDate(body.materialFeeDeadline) : undefined,
        intakeLabel: body.intakeLabel !== undefined ? (body.intakeLabel || null) : undefined,
      },
      create: {
        id: SETTINGS_ID,
        systemName: body.systemName || 'German Virtual School',
        supportEmail: body.supportEmail || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@germanvirtualschool.com',
        maxStudentsPerClass: body.maxStudentsPerClass || 25,
        defaultCurrency: body.defaultCurrency || 'USD',
        notifications: body.notifications || {},
        integrations: body.integrations || {},
        enrollmentStartDate: parseDate(body.enrollmentStartDate),
        enrollmentEndDate: parseDate(body.enrollmentEndDate),
        orientationDate: parseDate(body.orientationDate),
        firstClassDate: parseDate(body.firstClassDate),
        lastClassDate: parseDate(body.lastClassDate),
        // Seat Reservation & Material Fee Fields
        seatReservationFee: body.seatReservationFee ? Number(body.seatReservationFee) : null,
        materialFee: body.materialFee ? Number(body.materialFee) : null,
        materialFeeDeadline: parseDate(body.materialFeeDeadline),
        intakeLabel: body.intakeLabel || null,
      }
    });

    // Audit log the settings update
    await createAuditLog({
      userId: payload.userId,
      action: "SETTINGS_UPDATE",
      entity: "Settings",
      entityId: SETTINGS_ID,
      details: { updatedFields: Object.keys(body) }
    });

    return successResponse(settings, 'Settings updated successfully');
  } catch (error) {
    console.error('Update settings error:', error);
    return errors.internal('Failed to update system settings');
  }
}
