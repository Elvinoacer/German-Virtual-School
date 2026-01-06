import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

// PATCH: Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const payload = await authenticate(request);
    const { notificationId } = await params;
    const userId = payload.id || (payload as any).userId;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return errors.notFound('Notification');
    }

    if (notification.userId !== userId) {
      return errors.forbidden('Cannot modify this notification');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return successResponse(updated, 'Notification marked as read');
  } catch (error) {
    console.error('[NOTIFICATION_MARK_READ]', error);
    return errors.internal('Failed to mark notification as read');
  }
}

// DELETE: Delete a single notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const payload = await authenticate(request);
    const { notificationId } = await params;
    const userId = payload.id || (payload as any).userId;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return errors.notFound('Notification');
    }

    if (notification.userId !== userId) {
      return errors.forbidden('Cannot delete this notification');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return successResponse(null, 'Notification deleted');
  } catch (error) {
    console.error('[NOTIFICATION_DELETE]', error);
    return errors.internal('Failed to delete notification');
  }
}
