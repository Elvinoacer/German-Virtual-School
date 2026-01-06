import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') return errors.forbidden('Access denied');

    const terms = await prisma.academicTerm.findMany({
      orderBy: { startDate: 'desc' }
    });

    return successResponse(terms);
  } catch (error) {
    console.error('Fetch academic terms error:', error);
    return errors.internal('Failed to fetch academic terms');
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') return errors.forbidden('Access denied');

    const body = await request.json();
    const { name, startDate, endDate, isCurrent } = body;

    if (!name || !startDate || !endDate) {
      return errors.badRequest('Missing required fields');
    }

    // If setting as current, unset others
    if (isCurrent) {
      await prisma.academicTerm.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      });
    }

    const term = await prisma.academicTerm.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent: !!isCurrent
      }
    });

    return successResponse(term, 'Academic term created successfully', 201);
  } catch (error) {
    console.error('Create academic term error:', error);
    return errors.internal('Failed to create academic term');
  }
}
