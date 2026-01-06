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
          currency: 'KES',
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
    const { defaultFee, currency, billingCycle, lateFeeAction, taxRate } = body;

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
        currency: currency || 'KES',
        billingCycle: billingCycle || 'ONE_TIME',
        lateFeeAction,
        taxRate: parseFloat(taxRate || 0),
      }
    });

    return successResponse(settings, 'Billing settings updated successfully');
  } catch (error) {
    console.error('Update billing settings error:', error);
    return errors.internal('Failed to update billing settings');
  }
}
