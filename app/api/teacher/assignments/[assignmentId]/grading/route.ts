import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth-middleware';
import { successResponse, errorResponse, errors } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const user = await authenticate(request);
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      return errors.forbidden('Unauthorized');
    }

    const { assignmentId } = await params;

    // 1. Fetch Assignment Details
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            level: true,
          }
        }
      }
    });

    if (!assignment) {
      return errors.notFound('Assignment');
    }

    // 2. Fetch Enrolled Students
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: assignment.courseId,
        status: 'ACTIVE'
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
            email: true
          }
        }
      }
    });

    // 3. Fetch Submissions for this assignment
    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId: assignmentId
      }
    });

    // 4. Combine Data
    const studentsData = enrollments.map(enrollment => {
      const submission = submissions.find(s => s.studentId === enrollment.student.id);
      
      let status = 'MISSING';
      if (submission) {
        status = submission.status; // SUBMITTED, LATE, GRADED
      } else {
        // Check if due date passed
        if (new Date() > new Date(assignment.dueDate)) {
          status = 'MISSING'; // or LATE if allowed
        } else {
          status = 'PENDING'; // Not submitted yet, but not late
        }
      }

      return {
        student: enrollment.student,
        status: status,
        submission: submission || null
      };
    });

    return successResponse({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        dueDate: assignment.dueDate,
        maxPoints: assignment.maxPoints,
        course: assignment.course
      },
      students: studentsData
    });

  } catch (error) {
    console.error('Error fetching grading data:', error);
    return errors.internal('Failed to fetch grading data');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const user = await authenticate(request);
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      return errors.forbidden('Unauthorized');
    }

    const { assignmentId } = await params;
    const payload = await request.json();
    const { studentId, grade, feedback } = payload;

    if (!studentId || grade === undefined) {
      return errors.badRequest('Missing required fields');
    }

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: assignmentId,
          studentId: studentId,
        },
      },
      update: {
        grade: parseFloat(grade),
        feedback: feedback,
        status: 'GRADED',
        gradedAt: new Date(),
        gradedById: user.id,
      },
      create: {
        assignmentId: assignmentId,
        studentId: studentId,
        grade: parseFloat(grade),
        feedback: feedback,
        status: 'GRADED',
        gradedAt: new Date(),
        gradedById: user.id,
        submittedAt: new Date(), // Assume submitted now if creating new
      },
    });

    return successResponse({ submission }, 'Grade submitted successfully');

  } catch (error) {
    console.error('Error submitting grade:', error);
    return errors.internal('Failed to submit grade');
  }
}
