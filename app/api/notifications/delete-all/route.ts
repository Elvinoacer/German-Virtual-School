import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

// DELETE: Delete all notifications for the current user
export async function DELETE(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    const userId = payload.id || (payload as any).userId;

    await prisma.notification.deleteMany({
      where: { userId },
    });

    return successResponse(null, 'All notifications deleted');
  } catch (error) {
    console.error('[NOTIFICATION_DELETE_ALL]', error);
    return errors.internal('Failed to delete all notifications');
  }
}
