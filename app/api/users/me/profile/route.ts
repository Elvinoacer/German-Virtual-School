import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { UserRole } from '@/generated/prisma/client';

export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user
    const payload = await authenticate(request);

    const body = await request.json();

    // Update profile based on role
    if (payload.role === 'STUDENT') {
      const { dateOfBirth, phoneNumber, address, emergencyContact } = body;

      const profile = await prisma.studentProfile.update({
        where: { userId: payload.userId },
        data: {
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(phoneNumber !== undefined && { phoneNumber }),
          ...(address !== undefined && { address }),
          ...(emergencyContact !== undefined && { emergencyContact }),
        },
      });

      return successResponse(profile);
    } else if (payload.role === 'TEACHER') {
      const { bio, specialization, qualifications, hourlyRate } = body;

      const profile = await prisma.teacherProfile.update({
        where: { userId: payload.userId },
        data: {
          ...(bio !== undefined && { bio }),
          ...(specialization !== undefined && { specialization }),
          ...(qualifications && { qualifications }),
          ...(hourlyRate !== undefined && { hourlyRate }),
        },
      });

      return successResponse(profile);
    }

    return errors.badRequest('Invalid user role');
  } catch (error) {
    console.error('Update profile error:', error);
    return errors.internal('Failed to update profile');
  }
}
