import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const user = await authenticate(request);
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      return errors.forbidden('Unauthorized');
    }

    const { studentId } = await params;
    const { content, category } = await request.json();

    if (!content) {
      return errors.badRequest('Note content is required');
    }

    const note = await prisma.teacherNote.create({
      data: {
        studentId,
        teacherId: user.id,
        content,
        category: category || 'General',
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return successResponse(note, 'Note created successfully', 201);
  } catch (error) {
    console.error('Error creating teacher note:', error);
    return errors.internal('Failed to create teacher note');
  }
}
