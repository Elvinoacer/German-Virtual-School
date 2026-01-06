import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const payload = await authenticate(request);
    const { notificationId } = await params;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return errors.notFound('Notification');
    }

    if (notification.userId !== payload.userId) {
      return errors.forbidden('Not your notification');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return successResponse(updated);
  } catch (error) {
    console.error('Mark notification read error:', error);
    return errors.internal('Failed to mark notification as read');
  }
}
