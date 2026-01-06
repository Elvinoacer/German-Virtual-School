import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const payload = await authenticate(request);

    // Fetch user with profile
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        image: true,
        isVerified: true,
        studentProfile: true,
        teacherProfile: true,
        _count: {
            select: {
                enrollments: true
            }
        },
        attendanceRecords: {
            select: {
                status: true
            }
        }
      },
    });

    if (!user) {
      return errors.notFound('User');
    }

    // Determine which profile to include
    const profile = user.role === 'STUDENT' ? user.studentProfile : user.teacherProfile;
    
    // Calculate Attendance
    const totalAttendance = user.attendanceRecords.length;
    const presentAttendance = user.attendanceRecords.filter(r => r.status === 'PRESENT').length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0;

    return successResponse({
      ...user,
      profile,
      stats: {
          courses: user._count.enrollments,
          attendanceRate
      },
      studentProfile: undefined,
      teacherProfile: undefined,
      attendanceRecords: undefined,
      _count: undefined
    });
  } catch (error) {
    console.error('Get user error:', error);
    return errors.unauthorized();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user
    const payload = await authenticate(request);

    const body = await request.json();
    const { firstName, lastName, avatarUrl, phoneNumber, address, emergencyContact } = body;

    // Update basic user info
    const userUpdateData: any = {};
    if (firstName !== undefined) userUpdateData.firstName = firstName;
    if (lastName !== undefined) userUpdateData.lastName = lastName;
    if (avatarUrl !== undefined) {
      userUpdateData.avatarUrl = avatarUrl;
      userUpdateData.image = avatarUrl;
    }

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: userUpdateData,
    });
    
    // Update Role Specific Profile
    if (user.role === 'STUDENT' && (phoneNumber !== undefined || address !== undefined || emergencyContact !== undefined)) {
        await prisma.studentProfile.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                phoneNumber: phoneNumber || null,
                address: address || null,
                emergencyContact: emergencyContact || null,
            },
            update: {
                ...(phoneNumber !== undefined && { phoneNumber }),
                ...(address !== undefined && { address }),
                ...(emergencyContact !== undefined && { emergencyContact }),
            }
        });
    } else if (user.role === 'TEACHER' || user.role === 'ADMIN') {
        const { bio, specialization, qualifications, hourlyRate } = body;
        await prisma.teacherProfile.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                bio: bio || null,
                specialization: specialization || null,
                qualifications: qualifications || [],
                hourlyRate: hourlyRate !== undefined ? hourlyRate : null,
                phoneNumber: phoneNumber || null,
                address: address || null
            },
            update: {
                ...(bio !== undefined && { bio }),
                ...(specialization !== undefined && { specialization }),
                ...(qualifications !== undefined && { qualifications }),
                ...(hourlyRate !== undefined && { hourlyRate }),
                ...(phoneNumber !== undefined && { phoneNumber }),
                ...(address !== undefined && { address })
            }
        });
    }

    return successResponse(user);
  } catch (error) {
    console.error('Update user error:', error);
    if (error instanceof Error && error.message.includes('Prisma')) {
        return errors.internal(`Database Error: ${error.message}`);
    }
    return errors.internal('Failed to update user');
  }
}
