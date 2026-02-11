import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    // Only ADMINs can create fee plans now (Teachers restricted)
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Only administrators can create fee plans');
    }

    const body = await request.json();
    const { courseId, amount, billingCycle, installments } = body;

    // Validate
    if (!courseId || !amount || !billingCycle) {
      return errors.badRequest('Missing required fields');
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
      
      if (payload.role !== 'ADMIN') {
          return errors.forbidden('Access denied');
      }
      
      const { searchParams } = new URL(request.url);
      const courseId = searchParams.get('courseId');

      const where: any = {};
      
      if (courseId) {
          where.courseId = courseId;
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
