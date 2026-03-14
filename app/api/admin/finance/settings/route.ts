import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') return errors.forbidden('Access denied');

    const settings = await prisma.globalBillingSettings.findUnique({
      where: { id: 'global-settings' }
    });

    // Seed default settings if none exist
    if (!settings) {
      const defaultSettings = await prisma.globalBillingSettings.create({
        data: {
          id: 'global-settings',
          defaultFee: 5000,
          currency: 'USD',
          billingCycle: 'ONE_TIME',
          taxRate: 0
        }
      });
      return successResponse(defaultSettings);
    }

    return successResponse(settings);
  } catch (error) {
    console.error('Fetch billing settings error:', error);
    return errors.internal('Failed to fetch billing settings');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') return errors.forbidden('Access denied');

    const body = await request.json();
    const { defaultFee, currency, billingCycle, lateFeeAction, taxRate, applyToStudents } = body;

    const settings = await prisma.globalBillingSettings.upsert({
      where: { id: 'global-settings' },
      update: {
        defaultFee: defaultFee !== undefined ? parseFloat(defaultFee) : undefined,
        currency,
        billingCycle,
        lateFeeAction,
        taxRate: taxRate !== undefined ? parseFloat(taxRate) : undefined,
      },
      create: {
        id: 'global-settings',
        defaultFee: parseFloat(defaultFee || 0),
        currency: currency || 'USD',
        billingCycle: billingCycle || 'ONE_TIME',
        lateFeeAction,
        taxRate: parseFloat(taxRate || 0),
      }
    });

    // If applyToStudents is true, update all ACTIVE enrollments
    let updatedCount = 0;
    if (applyToStudents && billingCycle) {
      const result = await prisma.enrollment.updateMany({
        where: {
          status: 'ACTIVE'
        },
        data: {
          billingCycle: billingCycle
        }
      });
      updatedCount = result.count;
    }

    return successResponse({ ...settings, updatedEnrollments: updatedCount }, 'Billing settings updated successfully');
  } catch (error) {
    console.error('Update billing settings error:', error);
    return errors.internal('Failed to update billing settings');
  }
}
