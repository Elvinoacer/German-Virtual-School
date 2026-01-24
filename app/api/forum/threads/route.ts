import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { ThreadAudience, NotificationType } from '@/generated/prisma/client';
import { notify } from '@/lib/notifications/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    const body = await request.json();
    const { courseId, title, content, audience, isAnonymous } = body;

    // Validation
    if (!title || !content || !audience) {
      return errors.badRequest('Missing required fields');
    }

    if (audience === 'COURSE_ONLY' && !courseId) {
        return errors.badRequest('Course selection is required for Course-Only threads');
    }

    // If course-specific, verify enrollment/ownership
    if (courseId) {
      // ... (existing verification logic)
      if (payload.role === 'STUDENT') {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: payload.id, // Fixed: payload.id, not payload.userId (check auth-middleware return type)
              courseId,
            },
          },
        });
        if (!enrollment) return errors.forbidden('Not enrolled in this course');
      } else if (payload.role === 'TEACHER') {
        const course = await prisma.course.findFirst({
          where: { id: courseId, teacherId: payload.id },
        });
        if (!course) return errors.forbidden('You do not own this course');
      }
    }

    const thread = await prisma.forumThread.create({
      data: {
        authorId: payload.id,
        courseId: courseId || null,
        title,
        content,
        audience: audience as ThreadAudience,
        isAnonymous: isAnonymous || false,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    // Notify if audience is COURSE_ONLY (Notify course students)
    if (audience === 'COURSE_ONLY' && courseId) {
        try {
            const enrollments = await prisma.enrollment.findMany({
                where: { courseId, status: 'ACTIVE' },
                select: { studentId: true, student: { select: { email: true, fcmTokens: true } } }
            });

            const notifications = enrollments.map(enrollment => 
                 notify({
                    userId: enrollment.studentId,
                    title: `New Forum Post: ${title}`,
                    message: `A new discussion has been posted in your course.`,
                    type: NotificationType.FORUM_REPLY,
                    email: { to: enrollment.student.email },
                    push: { tokens: enrollment.student.fcmTokens },
                    metadata: {
                        link: `/forum/${thread.id}`,
                        threadId: thread.id,
                        courseId
                    }
                })
            );
            // Non-blocking
            Promise.allSettled(notifications).catch(err => console.error("Forum notification error", err));

        } catch (err) {
             console.error("Failed to setup forum notifications", err);
        }
    }

    return successResponse(thread, 'Thread created successfully', 201);
  } catch (error) {
    console.error('Create thread error:', error);
    return errors.internal('Failed to create thread');
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    const { searchParams } = new URL(request.url);

    const courseId = searchParams.get('courseId');
    const audience = searchParams.get('audience') as ThreadAudience | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const where: any = {};

    if (courseId) where.courseId = courseId;
    if (audience) where.audience = audience;

    // Access Control Logic
    // If filtering by TEACHERS_ONLY, ensure user is teacher/admin
    if (audience === 'TEACHERS_ONLY' && payload.role === 'STUDENT') {
      return errors.forbidden('Access denied to teacher threads');
    }
    
    // If not admin/teacher, maybe limit what they can see if no audience specified? 
    // Usually fetching ALL threads might show restricted ones.
    // If no audience filter, default to showing PUBLIC and COURSE_ONLY (if enrolled) and TEACHERS_ONLY (if teacher)
    if (!audience) {
      const conditions: any[] = [{ audience: 'PUBLIC' }];
      
      if (payload.role === 'TEACHER' || payload.role === 'ADMIN') {
        conditions.push({ audience: 'TEACHERS_ONLY' });
        // Teachers see threads from their courses? Or all course threads?
        // Let's assume teachers can see all course threads for now or we filter by their courses.
        // For simplicity: Teachers see everything, or explicitly filter.
        // Actually, let's keep it simple: Public + enrolled/teaching courses.
      }
      
      // Add COURSE_ONLY threads where user is enrolled/teaching
      // This is complex query. For MVP, we might rely on client filtering or simple "audience" param.
      // But purely relying on client is insecure.
      // Let's just handle specific audience requests or default to PUBLIC.
      if (!audience) {
         // Default to public if no specific audience requested?
         // Or return PUBLIC + visible others.
         // Let's stick to simple "where" construction.
         // If audience is not provided, we might return all PUBLIC.
         where.audience = 'PUBLIC'; 
      }
    }

    const [threads, total] = await Promise.all([
      prisma.forumThread.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              role: true,
            },
          },
          _count: {
            select: {
              posts: true,
            },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.forumThread.count({ where }),
    ]);

    // Mask anonymous authors
    const processedThreads = threads.map(thread => {
      if (thread.isAnonymous) {
        // Teachers/Admins can see who posted (moderation)
        if (payload.role === 'TEACHER' || payload.role === 'ADMIN') {
           return { ...thread, authorNameHidden: true }; // Flag to UI that it's anonymous but revealed
        }
        // Students see "Anonymous"
        return {
          ...thread,
          author: {
            id: 'anonymous',
            firstName: 'Anonymous',
            lastName: '',
            avatarUrl: null,
            role: 'STUDENT', // Mask role too?
          }
        };
      }
      return thread;
    });

    return successResponse({
      data: processedThreads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get threads error:', error);
    return errors.internal('Failed to fetch threads');
  }
}
