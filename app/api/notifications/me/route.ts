import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    const { searchParams } = new URL(request.url);

    const isRead = searchParams.get('isRead');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {
      userId: payload.userId,
    };

    if (isRead !== null) {
      where.isRead = isRead === 'true';
    }

    const notifications = await prisma.notification.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    return errors.internal('Failed to fetch notifications');
  }
}
