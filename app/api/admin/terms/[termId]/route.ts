import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ termId: string }> }
) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') return errors.forbidden('Access denied');

    const { termId } = await params;
    const body = await request.json();
    const { name, startDate, endDate, isCurrent } = body;

    // If setting as current, unset others
    if (isCurrent) {
      await prisma.academicTerm.updateMany({
        where: { NOT: { id: termId }, isCurrent: true },
        data: { isCurrent: false }
      });
    }

    const term = await prisma.academicTerm.update({
      where: { id: termId },
      data: {
        name,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isCurrent: isCurrent !== undefined ? !!isCurrent : undefined
      }
    });

    return successResponse(term, 'Academic term updated successfully');
  } catch (error) {
    console.error('Update academic term error:', error);
    return errors.internal('Failed to update academic term');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ termId: string }> }
) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') return errors.forbidden('Access denied');

    const { termId } = await params;

    await prisma.academicTerm.delete({
      where: { id: termId }
    });

    return successResponse(null, 'Academic term deleted successfully');
  } catch (error) {
    console.error('Delete academic term error:', error);
    return errors.internal('Failed to delete academic term');
  }
}
