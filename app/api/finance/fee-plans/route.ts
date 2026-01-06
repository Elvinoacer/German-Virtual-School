import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    // Only teachers/admins can create fee plans
    if (payload.role === 'STUDENT') {
      return errors.forbidden('Authorized access only');
    }

    const body = await request.json();
    const { courseId, amount, billingCycle, installments } = body;

    // Validate
    if (!courseId || !amount || !billingCycle) {
      return errors.badRequest('Missing required fields');
    }

    // Verify course ownership
    if (payload.role === 'TEACHER') {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { teacherId: true }
        });
        if (!course || course.teacherId !== payload.id) {
            return errors.forbidden('You do not own this course');
        }
    }

    const feePlan = await prisma.feePlan.create({
      data: {
        courseId,
        amount,
        billingCycle,
        installments: installments || 1,
      },
    });

    return successResponse(feePlan, 'Fee plan created successfully', 201);
  } catch (error) {
    console.error('Create fee plan error:', error);
    return errors.internal('Failed to create fee plan');
  }
}

export async function GET(request: NextRequest) {
    try {
      const payload = await authenticate(request);
      // Teacher sees their course fee plans
      // Admin sees all? 
      // Simplified: Get all fee plans for courses owned by teacher
      
      const { searchParams } = new URL(request.url);
      const courseId = searchParams.get('courseId');

      const where: any = {};
      
      if (courseId) {
          where.courseId = courseId;
      }
      
      if (payload.role === 'TEACHER') {
          where.course = { teacherId: payload.id };
      }

      const feePlans = await prisma.feePlan.findMany({
        where,
        include: {
            course: { select: { title: true } }
        }
      });
  
      return successResponse(feePlans);
    } catch (error) {
      console.error('Get fee plans error:', error);
      return errors.internal('Failed to fetch fee plans');
    }
}
