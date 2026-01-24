import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

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

    return successResponse(assignment, 'Assignment created successfully', 201);
  } catch (error) {
    console.error('Create assignment error:', error);
    return errors.internal('Failed to create assignment');
  }
}
