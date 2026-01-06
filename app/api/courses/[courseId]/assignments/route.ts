import { NextRequest } from 'next/server';
import { authenticate, isTeacherOfCourse } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== 'TEACHER') {
      return errors.forbidden('Only teachers can create assignments');
    }

    const { courseId } = await params;

    // Verify teacher owns the course
    const isOwner = await isTeacherOfCourse(payload.userId, courseId);
    if (!isOwner) {
      return errors.forbidden('You do not own this course');
    }

    const body = await request.json();
    const { title, description, dueDate, maxPoints, rubric } = body;

    // Validation
    if (!title || !description || !dueDate || !maxPoints) {
      return errors.badRequest('Missing required fields');
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        title,
        description,
        dueDate: new Date(dueDate),
        maxPoints,
        rubric: rubric || null,
      },
    });

    return successResponse(assignment, 'Assignment created successfully', 201);
  } catch (error) {
    console.error('Create assignment error:', error);
    return errors.internal('Failed to create assignment');
  }
}
