import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { authenticate } from '@/lib/auth-middleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await authenticate(request);

    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Only admins can manage testimonials');
    }

    const body = await request.json();
    const { isApproved, isFeatured } = body;

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(typeof isApproved === 'boolean' && { isApproved }),
        ...(typeof isFeatured === 'boolean' && { isFeatured }),
      },
    });

    return successResponse(testimonial, 'Testimonial updated successfully');
  } catch (error) {
    console.error('Update testimonial error:', error);
    return errors.internal('Failed to update testimonial');
  }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const payload = await authenticate(request);
  
      if (payload.role !== 'ADMIN') {
        return errors.forbidden('Only admins can delete testimonials');
      }
  
      await prisma.testimonial.delete({
        where: { id },
      });
  
      return successResponse(null, 'Testimonial deleted successfully');
    } catch (error) {
      console.error('Delete testimonial error:', error);
      return errors.internal('Failed to delete testimonial');
    }
  }
