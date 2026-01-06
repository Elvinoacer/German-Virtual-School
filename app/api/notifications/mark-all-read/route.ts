import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

// POST: Mark all notifications as read for the current user
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    const userId = payload.id || (payload as any).userId;

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return successResponse(null, 'All notifications marked as read');
  } catch (error) {
    console.error('[NOTIFICATION_MARK_ALL_READ]', error);
    return errors.internal('Failed to mark all notifications as read');
  }
}
