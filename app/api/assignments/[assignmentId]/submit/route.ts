import { NextRequest } from 'next/server';
import { authenticate, isStudentEnrolled } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { notify } from '@/lib/notifications/orchestrator';
import { NotificationType } from '@/generated/prisma/client';

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

    // Get assignment with course and teacher info
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { 
        course: { 
          include: { 
            teacher: { select: { id: true, email: true, fcmTokens: true } } 
          } 
        } 
      },
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

    // Notify the course teacher about the new submission
    const student = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { firstName: true, lastName: true }
    });

    if (assignment.course.teacher && student) {
      notify({
        userId: assignment.course.teacher.id,
        title: 'New Assignment Submission',
        message: `${student.firstName} ${student.lastName} submitted "${assignment.title}"`,
        type: NotificationType.INFO,
        email: { to: assignment.course.teacher.email },
        push: { tokens: assignment.course.teacher.fcmTokens },
        metadata: { link: `/teacher/assignments/${assignmentId}/grading`, submissionId: submission.id }
      }).catch(err => console.error('Submission notification error:', err));
    }

    return successResponse(submission, 'Assignment submitted successfully', 201);
  } catch (error) {
    console.error('Submit assignment error:', error);
    return errors.internal('Failed to submit assignment');
  }
}
