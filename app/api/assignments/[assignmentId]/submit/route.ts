import { NextRequest } from 'next/server';
import { authenticate, isStudentEnrolled } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== 'STUDENT') {
      return errors.forbidden('Only students can submit assignments');
    }

    const { assignmentId } = await params;

    // Get assignment and verify student is enrolled
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { courseId: true },
    });

    if (!assignment) {
      return errors.notFound('Assignment');
    }

    const isEnrolled = await isStudentEnrolled(payload.userId, assignment.courseId);
    if (!isEnrolled) {
      return errors.forbidden('Not enrolled in this course');
    }

    // Check if already submitted
    const existing = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: payload.userId,
        },
      },
    });

    if (existing) {
      return errors.conflict('Assignment already submitted');
    }

    const body = await request.json();
    const { content, attachmentUrls } = body;

    if (!content && (!attachmentUrls || attachmentUrls.length === 0)) {
      return errors.badRequest('Submission must include content or attachments');
    }

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: payload.userId,
        content,
        attachmentUrls: attachmentUrls || [],
        status: 'SUBMITTED',
      },
    });

    return successResponse(submission, 'Assignment submitted successfully', 201);
  } catch (error) {
    console.error('Submit assignment error:', error);
    return errors.internal('Failed to submit assignment');
  }
}
