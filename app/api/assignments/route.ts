import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { notify } from '@/lib/notifications/orchestrator';
import { NotificationType } from '@/generated/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    const where: any = {};

    if (courseId) {
      where.courseId = courseId;
      
    // Verify student is enrolled if they're a student
      if (payload.role === 'STUDENT') {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: payload.id,
              courseId,
            },
          },
        });

        if (!enrollment) {
          return errors.forbidden('Not enrolled in this course');
        }

        // [RESTRICTION] Only show assignments if the course teacher is the student's mentor
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: payload.id },
            select: { mentorId: true }
        });

        // We need to check if the course teacher is the mentor.
        // We can do this by fetching the course teacherId
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { teacherId: true }
        });

        if (course?.teacherId !== studentProfile?.mentorId) {
             // If strict restriction is required, we return empty or error.
             // Returning empty list is safer for UI.
             return successResponse([]);
        }
      }
    } else {
        // If courseId is NOT provided, and user is STUDENT, we must filter globally
        if (payload.role === 'STUDENT') {
            const studentProfile = await prisma.studentProfile.findUnique({
                where: { userId: payload.id },
                select: { mentorId: true }
            });

            if (studentProfile?.mentorId) {
                where.course = {
                    teacherId: studentProfile.mentorId
                };
            } else {
                // No mentor => No assignments visible? Or just no filtering (which shows all)?
                // Request says "only for those assigned". So if not assigned, see nothing.
                return successResponse([]);
            }
        }
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        submissions: payload.role === 'STUDENT' ? {
          where: { studentId: payload.id },
        } : undefined,
      },
      orderBy: { dueDate: 'asc' },
    });

    return successResponse(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    return errors.internal('Failed to fetch assignments');
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    if (payload.role !== 'TEACHER') {
      return errors.forbidden('Only teachers can create assignments');
    }

    const body = await request.json();
    const { title, description, dueDate, maxPoints, courseId, attachmentUrls, rubric } = body;

    // Validate required fields
    if (!title || !dueDate || !courseId) {
      return errors.badRequest('Missing required fields');
    }

    // Verify teacher owns the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true }
    });

    if (!course) {
      return errors.notFound('Course not found');
    }

    if (course.teacherId !== payload.id) {
      return errors.forbidden('You can only create assignments for your own courses');
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        maxPoints: maxPoints || 100,
        courseId,
        attachmentUrls: attachmentUrls || [],
        rubric: rubric || null,
      },
    });

    // Notify all enrolled students who are ALSO assigned (Mentees)
    const enrollments = await prisma.enrollment.findMany({
      where: { 
        courseId, 
        status: 'ACTIVE',
        student: {
            studentProfile: {
                mentorId: payload.id
            }
        }
      },
      select: { studentId: true, student: { select: { email: true, fcmTokens: true } } }
    });

    const dueDateFormatted = new Date(dueDate).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });

    enrollments.forEach(enrollment => {
      notify({
        userId: enrollment.studentId,
        title: `New Assignment: ${title}`,
        message: `A new assignment has been posted. Due: ${dueDateFormatted}`,
        type: NotificationType.ASSIGNMENT_NEW,
        email: { to: enrollment.student.email },
        push: { tokens: enrollment.student.fcmTokens },
        metadata: { link: `/student/courses/${courseId}` },
      }).catch(err => console.error('Assignment notification error:', err));
    });

    return successResponse(assignment, 'Assignment created successfully', 201);
  } catch (error) {
    console.error('Create assignment error:', error);
    return errors.internal('Failed to create assignment');
  }
}
