import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function POST(request: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const payload = await authenticate(request);
    
    if (payload.role !== 'TEACHER' && payload.role !== 'ADMIN') {
      return errors.forbidden('Authorized access only');
    }
    
    const { studentId } = await params;

    const body = await request.json();
    const { courseId, grade, trend, feedback, category } = body;

    if (!courseId || !grade) {
        return errors.badRequest('Missing required fields');
    }

    // Verify Teacher owns the course if strictly enforced
    // For now allow if Teacher Role.

    const evaluation = await prisma.evaluation.create({
      data: {
        studentId,
        teacherId: payload.id,
        courseId,
        grade: Number(grade),
        trend,
        overallComment: feedback,
        category: category || 'General'
      }
    });

    return successResponse(evaluation, 'Evaluation submitted successfully', 201);
  } catch (error) {
    console.error('Submit evaluation error:', error);
    return errors.internal('Failed to submit evaluation');
  }
}
