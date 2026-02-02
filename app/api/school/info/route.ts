import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

/**
 * PUBLIC endpoint - No authentication required!
 * Returns only non-sensitive school information for prospective students.
 * 
 * SECURITY: This endpoint carefully selects ONLY public-safe fields.
 * No user PII, no internal settings, no financial details beyond published fees.
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all public data in parallel for performance
    const [settings, billingSettings, currentTerm, stats, testimonials] = await Promise.all([
      // System settings - only public fields
      prisma.systemSettings.findUnique({
        where: { id: 'system-settings' },
        select: {
          systemName: true,
          supportEmail: true,
          enrollmentStartDate: true,
          enrollmentEndDate: true,
          orientationDate: true,
          firstClassDate: true,
          lastClassDate: true,
        }
      }),
      
      // Billing settings - only fee info for transparency
      prisma.globalBillingSettings.findFirst({
        select: {
          defaultFee: true,
          currency: true,
        }
      }),
      
      // Current academic term
      prisma.academicTerm.findFirst({
        where: { isCurrent: true },
        select: {
          name: true,
          startDate: true,
          endDate: true,
        }
      }),
      
      // Aggregate stats only (no PII)
      Promise.all([
        prisma.course.count({ where: { status: 'PUBLISHED' } }),
        prisma.user.count({ where: { role: 'STUDENT', isVerified: true } }),
        prisma.user.count({ where: { role: 'TEACHER' } }),
      ]),
      
      // Approved testimonials only
      prisma.testimonial.findMany({
        where: { isApproved: true },
        select: {
          id: true,
          content: true,
          rating: true,
          createdAt: true,
          student: {
            select: {
              firstName: true,
              // lastName excluded for privacy - only first name shown
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5, // Limit to 5 most recent
      }),
    ]);

    // Compute enrollment status
    const now = new Date();
    const enrollmentStart = settings?.enrollmentStartDate;
    const enrollmentEnd = settings?.enrollmentEndDate;
    
    let enrollmentStatus: 'open' | 'closed' | 'upcoming' = 'open';
    let enrollmentMessage = 'Enrollment is currently open.';

    if (enrollmentStart && now < enrollmentStart) {
      enrollmentStatus = 'upcoming';
      enrollmentMessage = `Enrollment opens on ${enrollmentStart.toLocaleDateString('en-US', { 
        month: 'long', day: 'numeric', year: 'numeric' 
      })}.`;
    } else if (enrollmentEnd && now > enrollmentEnd) {
      enrollmentStatus = 'closed';
      enrollmentMessage = `Enrollment closed on ${enrollmentEnd.toLocaleDateString('en-US', { 
        month: 'long', day: 'numeric', year: 'numeric' 
      })}. Please check back for the next enrollment period.`;
    } else if (enrollmentEnd) {
      enrollmentMessage = `Enrollment is open until ${enrollmentEnd.toLocaleDateString('en-US', { 
        month: 'long', day: 'numeric', year: 'numeric' 
      })}.`;
    }

    return successResponse({
      school: {
        name: settings?.systemName || 'German Virtual School',
        supportEmail: settings?.supportEmail || null,
      },
      enrollment: {
        status: enrollmentStatus,
        message: enrollmentMessage,
        startDate: settings?.enrollmentStartDate,
        endDate: settings?.enrollmentEndDate,
      },
      calendar: {
        orientationDate: settings?.orientationDate,
        firstClassDate: settings?.firstClassDate,
        lastClassDate: settings?.lastClassDate,
      },
      currentTerm: currentTerm ? {
        name: currentTerm.name,
        startDate: currentTerm.startDate,
        endDate: currentTerm.endDate,
      } : null,
      fees: billingSettings ? {
        semesterFee: Number(billingSettings.defaultFee),
        currency: billingSettings.currency,
      } : null,
      stats: {
        totalCourses: stats[0],
        totalStudents: stats[1],
        totalTeachers: stats[2],
      },
      testimonials: testimonials.map(t => ({
        id: t.id,
        content: t.content,
        rating: t.rating,
        studentName: t.student.firstName, // First name only for privacy
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error('Fetch public school info error:', error);
    return errors.internal('Failed to fetch school information');
  }
}
