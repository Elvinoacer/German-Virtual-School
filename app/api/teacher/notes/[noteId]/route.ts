import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const user = await authenticate(request);
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      return errors.forbidden('Unauthorized');
    }

    const { noteId } = await params;
    const { content, category } = await request.json();

    const note = await prisma.teacherNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return errors.notFound('Note');
    }

    if (note.teacherId !== user.id && user.role !== 'ADMIN') {
      return errors.forbidden('You can only edit your own notes');
    }

    const updatedNote = await prisma.teacherNote.update({
      where: { id: noteId },
      data: {
        content,
        category,
      },
    });

    return successResponse(updatedNote, 'Note updated successfully');
  } catch (error) {
    console.error('Error updating teacher note:', error);
    return errors.internal('Failed to update teacher note');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const user = await authenticate(request);
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      return errors.forbidden('Unauthorized');
    }

    const { noteId } = await params;

    const note = await prisma.teacherNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return errors.notFound('Note');
    }

    if (note.teacherId !== user.id && user.role !== 'ADMIN') {
      return errors.forbidden('You can only delete your own notes');
    }

    await prisma.teacherNote.delete({
      where: { id: noteId },
    });

    return successResponse(null, 'Note deleted successfully');
  } catch (error) {
    console.error('Error deleting teacher note:', error);
    return errors.internal('Failed to delete teacher note');
  }
}
