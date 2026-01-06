import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const user = await authenticate(request);
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      return errors.forbidden('Unauthorized');
    }

    const { studentId } = await params;

    // Fetch student with profile, enrollments (relevant to teacher), and notes
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        image: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        createdAt: true,
        studentProfile: true,
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                level: true,
                teacherId: true,
              },
            },
          },
        },
        receivedNotes: {
          where: { teacherId: user.id },
          orderBy: { createdAt: 'desc' },
          include: {
            teacher: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return errors.notFound('Student');
    }

    // Security check: If teacher, ensure they teach at least one course the student is in
    if (user.role === 'TEACHER') {
      const isTeacherOfStudent = student.enrollments.some(
        (e) => e.course.teacherId === user.id
      );
      if (!isTeacherOfStudent) {
        return errors.forbidden('You do not have permission to view this student');
      }
    }

    return successResponse({
      ...student,
      currentTeacherId: user.id
    });
  } catch (error) {
    console.error('Error fetching student detail:', error);
    return errors.internal('Failed to fetch student details');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const user = await authenticate(request);
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      return errors.forbidden('Unauthorized');
    }

    const { studentId } = await params;
    const body = await request.json();
    const { firstName, lastName, studentProfile } = body;

    // Update User and StudentProfile
    const updatedUser = await prisma.user.update({
      where: { id: studentId },
      data: {
        firstName,
        lastName,
        studentProfile: studentProfile ? {
          upsert: {
            create: {
              dateOfBirth: studentProfile.dateOfBirth ? new Date(studentProfile.dateOfBirth) : null,
              phoneNumber: studentProfile.phoneNumber,
              address: studentProfile.address,
              emergencyContact: studentProfile.emergencyContact,
            },
            update: {
              dateOfBirth: studentProfile.dateOfBirth ? new Date(studentProfile.dateOfBirth) : null,
              phoneNumber: studentProfile.phoneNumber,
              address: studentProfile.address,
              emergencyContact: studentProfile.emergencyContact,
            },
          },
        } : undefined,
      },
      include: {
        studentProfile: true,
      },
    });

    return successResponse(updatedUser, 'Student updated successfully');
  } catch (error) {
    console.error('Error updating student:', error);
    return errors.internal('Failed to update student');
  }
}
