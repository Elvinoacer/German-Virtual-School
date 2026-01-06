import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const user = await authenticate(request);
    const { threadId } = await params;
    const body = await request.json();
    const { content, isAnonymous } = body;

    if (!content) {
      return errors.badRequest('Content is required');
    }

    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      return errors.notFound('Thread');
    }

    if (thread.isLocked) {
        return errors.forbidden('This thread is locked.');
    }

    const post = await prisma.forumPost.create({
      data: {
        threadId,
        authorId: user.id,
        content,
        isAnonymous: isAnonymous || false,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return successResponse(post, 'Reply added successfully', 201);
  } catch (error) {
    console.error('Create post error:', error);
    return errors.internal('Failed to create post');
  }
}