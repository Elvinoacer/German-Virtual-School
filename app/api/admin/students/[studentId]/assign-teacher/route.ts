import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const user = await authenticate(request);

    // Only admins can assign teachers
    if (user.role !== 'ADMIN') {
      return errors.forbidden('Only admins can assign teachers');
    }

    const { studentId } = await params;
    const body = await request.json();
    const { teacherId } = body;

    // Validate request body
    if (teacherId === undefined) {
      return errors.badRequest('teacherId is required');
    }

    // Verify student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true }
    });

    if (!student) {
      return errors.notFound('Student not found');
    }

    // Prepare update data
    let updateData: any = {};

    if (teacherId === null) {
      // Remove assignment
      updateData = {
        mentorId: null
      };
    } else {
      // Verify teacher exists and is actually a teacher
      const teacher = await prisma.user.findUnique({
        where: { id: teacherId }
      });

      if (!teacher) {
        return errors.notFound('Teacher not found');
      }

      if (teacher.role !== 'TEACHER') {
        return errors.badRequest('Assigned user must be a teacher');
      }

      updateData = {
        mentorId: teacherId
      };
    }

    // Update student profile
    // If student has no profile, create one
    if (!student.studentProfile) {
      await prisma.studentProfile.create({
        data: {
          userId: student.id,
          ...updateData
        }
      });
    } else {
      await prisma.studentProfile.update({
        where: { userId: student.id },
        data: updateData
      });
    }

    return successResponse({
      message: teacherId ? 'Teacher assigned successfully' : 'Teacher assignment removed'
    });

  } catch (error) {
    console.error('Assign teacher error:', error);
    return errors.internal('Failed to assign teacher');
  }
}
