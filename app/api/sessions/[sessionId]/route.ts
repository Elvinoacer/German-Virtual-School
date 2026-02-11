import { NextRequest } from 'next/server';
import { authenticate, isStudentEnrolled, isTeacherOfCourse } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await authenticate(request);
    const { sessionId } = await params;

    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            level: true,
            modules: {
              include: {
                resources: true
              }
            }
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            image: true,
          },
        },
        attendance: {
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        image: true
                    }
                }
            }
        }
      },
    });

    if (!session) {
      return errors.notFound('Session');
    }

    // Authorization Check
    let authorized = false;
    const isModerator = user.role === 'ADMIN' || session.teacherId === user.id;

    if (user.role === 'ADMIN') {
      authorized = true;
    } else if (user.role === 'TEACHER') {
      // Any teacher can access any session
      authorized = true;
    } else if (user.role === 'STUDENT') {
      // Must be enrolled AND assigned to the session's teacher (Mentor)
      const isEnrolled = await isStudentEnrolled(user.id, session.courseId);
      
      if (isEnrolled) {
        // Check if student's mentor is the session teacher
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: user.id },
            select: { mentorId: true }
        });
        
        authorized = studentProfile?.mentorId === session.teacherId;
      } else {
        authorized = false;
      }
    }

    if (!authorized) {
      return errors.forbidden('You do not have access to this session. You must be assigned to this teacher.');
    }

    return successResponse({ ...session, isModerator });
  } catch (error) {
    console.error('Get session error:', error);
    return errors.internal('Failed to fetch session details');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await authenticate(request);
    const { sessionId } = await params;

    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return errors.notFound('Session');
    }

    // Only teacher of the course or admin can update
    const teacherId = user.id || (user as any).userId;
    if (user.role !== 'ADMIN' && session.teacherId !== teacherId) {
      return errors.forbidden('Not authorized to update this session');
    }

    const body = await request.json();
    const { recordingUrl, status, title, description, homework } = body;

    const updated = await prisma.classSession.update({
      where: { id: sessionId },
      data: {
        ...(recordingUrl !== undefined && { recordingUrl }),
        ...(status !== undefined && { status }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(homework !== undefined && { homework }),
      },
    });

    return successResponse(updated, 'Session updated successfully');
  } catch (error) {
    console.error('Update session error:', error);
    return errors.internal('Failed to update session');
  }
}