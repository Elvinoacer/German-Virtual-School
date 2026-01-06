import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const payload = await authenticate(request);
    
    // Ensure only admins access this
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Access denied');
    }

    const { studentId } = await params;

    const student = await prisma.user.findUnique({
      where: { id: studentId, role: 'STUDENT' }
    });

    if (!student) {
      return errors.notFound('Student');
    }

    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: { isVerified: true },
      select: {
         id: true,
         firstName: true,
         lastName: true,
         isVerified: true
      }
    });

    return successResponse(updatedStudent, 'Student verified successfully');

  } catch (error) {
    console.error('Verify student error:', error);
    return errors.internal('Failed to verify student');
  }
}
