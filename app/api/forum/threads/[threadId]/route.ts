import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  try {
     const payload = await authenticate(request); 
     const { threadId } = await params;

     const thread = await prisma.forumThread.findUnique({
        where: { id: threadId },
        include: {
            author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
            course: { select: { title: true, level: true } },
            posts: {
                orderBy: { createdAt: 'asc' },
                include: {
                    author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } }
                }
            }
        }
     });

     if (!thread) return errors.notFound('Thread not found');

     // Permission Check
     if (thread.audience === 'TEACHERS_ONLY' && payload.role === 'STUDENT') {
         return errors.forbidden('Restricted thread');
     }
     
     if (thread.audience === 'COURSE_ONLY' && thread.courseId) {
         // Verify enrollment logic... for now skip strict check to save DB calls if we trust GET list filtering? 
         // Better to check. simple check:
         if (payload.role === 'STUDENT') {
             const enr = await prisma.enrollment.findUnique({
                 where: { studentId_courseId: { studentId: payload.id, courseId: thread.courseId } }
             });
             // Only strict if we want to block direct link access. Let's block.
             if (!enr) return errors.forbidden('Not enrolled in course');
         }
     }

     // Masking
     if (thread.isAnonymous && payload.role === 'STUDENT') {
         // keep real ID hidden
         (thread.author as any).firstName = 'Anonymous';
         (thread.author as any).lastName = '';
         (thread.author as any).avatarUrl = null;
         (thread.author as any).id = 'anonymous';
     }

     thread.posts = thread.posts.map(p => {
         if (p.isAnonymous && payload.role === 'STUDENT') {
             return {
                 ...p,
                 author: { ...p.author, firstName: 'Anonymous', lastName: '', avatarUrl: null, id: 'anonymous' }
             };
         }
         return p;
     });

     return successResponse(thread);

  } catch (error) {
      return errors.internal('Failed to fetch thread');
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
    try {
        const payload = await authenticate(request);
        const { threadId } = await params;

        if (payload.role !== 'TEACHER' && payload.role !== 'ADMIN') {
            return errors.forbidden('Moderators only');
        }

        const body = await request.json();
        // Allow updating isLocked, isPinned
        const { isLocked, isPinned } = body;

        const updated = await prisma.forumThread.update({
            where: { id: threadId },
            data: {
                isLocked: isLocked !== undefined ? isLocked : undefined,
                isPinned: isPinned !== undefined ? isPinned : undefined
            }
        });

        return successResponse(updated, 'Thread updated');

    } catch (error) {
        return errors.internal('Failed to update thread');
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
    try {
        const payload = await authenticate(request);
        const { threadId } = await params;

        if (payload.role !== 'TEACHER' && payload.role !== 'ADMIN') {
             return errors.forbidden('Moderators only');
        }

        await prisma.forumThread.delete({ where: { id: threadId } });
        return successResponse(null, 'Thread deleted');

    } catch (error) {
        return errors.internal('Failed to delete thread');
    }
}
