import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

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
          supportEmail: 'support@gvs.edu.de',
          maxStudentsPerClass: 25,
          defaultCurrency: 'KES',
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
    
    const settings = await prisma.systemSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {
        systemName: body.systemName,
        supportEmail: body.supportEmail,
        maxStudentsPerClass: body.maxStudentsPerClass,
        defaultCurrency: body.defaultCurrency,
        notifications: body.notifications,
        integrations: body.integrations
      },
      create: {
        id: SETTINGS_ID,
        systemName: body.systemName || 'German Virtual School',
        supportEmail: body.supportEmail || 'support@gvs.edu.de',
        maxStudentsPerClass: body.maxStudentsPerClass || 25,
        defaultCurrency: body.defaultCurrency || 'KES',
        notifications: body.notifications || {},
        integrations: body.integrations || {}
      }
    });

    return successResponse(settings, 'Settings updated successfully');
  } catch (error) {
    console.error('Update settings error:', error);
    return errors.internal('Failed to update system settings');
  }
}
