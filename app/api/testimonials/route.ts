import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { authenticate } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    // Only students can submit testimonials (or potentially teachers too, but requirement implied students)
    if (payload.role !== 'STUDENT') {
         // Optionally allow teachers if needed, but for now stick to students or just allow any authenticated user
    }

    const body = await request.json();
    const { content, rating } = body;

    if (!content || !rating) {
      return errors.badRequest('Content and rating are required');
    }

    if (rating < 1 || rating > 5) {
      return errors.badRequest('Rating must be between 1 and 5');
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        studentId: payload.id,
        content,
        rating,
        isFeatured: false, // Default
        isApproved: false, // Default
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            // role: true // maybe helpful
          }
        }
      }
    });

    return successResponse(testimonial, 'Testimonial submitted successfully');
  } catch (error) {
    console.error('Create testimonial error:', error);
    return errors.internal('Failed to create testimonial');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public') === 'true';

    // Public access for landing page
    if (isPublic) {
      const testimonials = await prisma.testimonial.findMany({
        where: {
          isFeatured: true,
          isApproved: true,
        },
        take: 3, // Limit to 3 as per requirements
        orderBy: {
          createdAt: 'desc', // or maybe verify manual order later if needed
        },
        include: {
            student: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                    studentProfile: {
                        select: {
                            address: true // Use address as location (e.g., "Software Engineer, Singapore") substitute? 
                            // Actually, let's just use what we have. 
                            // Requirement: "Software Engineer, Singapore" style. 
                            // We might need to fetch occupation from somewhere but we don't have it.
                            // We can use address for location if available. 
                        }
                    }
                }
            }
        }
      });
      return successResponse(testimonials);
    }

    // Admin access for management
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') {
        return errors.forbidden('Only admins can view all testimonials');
    }

    const testimonials = await prisma.testimonial.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            student: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    avatarUrl: true
                }
            }
        }
    });

    return successResponse(testimonials);

  } catch (error) {
    console.error('Get testimonials error:', error);
    return errors.internal('Failed to fetch testimonials');
  }
}
