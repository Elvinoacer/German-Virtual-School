import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    if (payload.role !== 'STUDENT') {
      return errors.forbidden('Student access only');
    }

    // Get all invoices for the student
    const invoices = await prisma.invoice.findMany({
      where: {
        studentId: payload.id
      },
      include: {
        enrollment: {
            include: {
                course: { select: { title: true } }
            }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    return errors.internal('Failed to fetch invoices');
  }
}
