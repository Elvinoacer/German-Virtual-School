import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

// POST: Create a notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    // Only admins or teachers can create notifications for others
    if (payload.role !== 'ADMIN' && payload.role !== 'TEACHER') {
      return errors.forbidden('Cannot create notifications');
    }

    const body = await request.json();
    const { userId, type, title, message, data } = body;

    if (!userId || !type || !title || !message) {
      return errors.badRequest('Missing required fields: userId, type, title, message');
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || null,
      },
    });

    return successResponse(notification, 'Notification created');
  } catch (error) {
    console.error('[NOTIFICATION_CREATE]', error);
    return errors.internal('Failed to create notification');
  }
}
