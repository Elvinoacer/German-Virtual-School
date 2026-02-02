import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

/**
 * Public endpoint to get school calendar information
 * No authentication required - this is public info for potential students
 */
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'system-settings' },
      select: {
        enrollmentStartDate: true,
        enrollmentEndDate: true,
        orientationDate: true,
        firstClassDate: true,
        lastClassDate: true,
      }
    });

    if (!settings) {
      return successResponse({
        enrollmentStartDate: null,
        enrollmentEndDate: null,
        orientationDate: null,
        firstClassDate: null,
        lastClassDate: null,
        isEnrollmentOpen: true,
        enrollmentMessage: 'Enrollment is currently open.'
      });
    }

    const now = new Date();
    const enrollmentStart = settings.enrollmentStartDate;
    const enrollmentEnd = settings.enrollmentEndDate;
    
    // Determine enrollment status
    let isEnrollmentOpen = true;
    let enrollmentMessage = 'Enrollment is currently open.';

    if (enrollmentStart && now < enrollmentStart) {
      isEnrollmentOpen = false;
      enrollmentMessage = `Enrollment opens on ${enrollmentStart.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })}.`;
    } else if (enrollmentEnd && now > enrollmentEnd) {
      isEnrollmentOpen = false;
      enrollmentMessage = `Enrollment closed on ${enrollmentEnd.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })}. Please check back for the next enrollment period.`;
    } else if (enrollmentStart && enrollmentEnd) {
      enrollmentMessage = `Enrollment is open until ${enrollmentEnd.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })}.`;
    }

    return successResponse({
      ...settings,
      isEnrollmentOpen,
      enrollmentMessage
    });
  } catch (error) {
    console.error('Fetch school calendar error:', error);
    return errors.internal('Failed to fetch school calendar');
  }
}
