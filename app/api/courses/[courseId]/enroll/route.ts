import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== 'STUDENT') {
      return errors.forbidden('Only students can enroll in courses');
    }

    const { courseId } = await params;

    const studentId = payload.id || (payload as any).userId;

    if (!studentId) {
      return errors.unauthorized('User ID not found in session');
    }

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return errors.notFound('Course');
    }

    if (course.status !== 'PUBLISHED') {
      return errors.badRequest('Course is not available for enrollment');
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return errors.conflict('Already enrolled in this course');
    }

    // Fetch Billing context
    const [currentTerm, billingSettings] = await Promise.all([
      prisma.academicTerm.findFirst({ where: { isCurrent: true } }),
      prisma.globalBillingSettings.findFirst()
    ]);

    // Transaction to ensure atomicity of enrollment and invoicing
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create enrollment
      const enrollment = await tx.enrollment.create({
        data: {
          studentId,
          courseId,
        },
        include: {
          course: {
            select: { id: true, title: true, price: true },
          },
        },
      });

      const invoicesToCreate = [];
      const now = new Date();
      const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      // 2. Check for Semester Registration & Fee
      if (currentTerm && billingSettings && Number(billingSettings.defaultFee) > 0) {
        const existingRegistration = await tx.termRegistration.findUnique({
          where: {
            studentId_termId: {
              studentId,
              termId: currentTerm.id
            }
          }
        });

        if (!existingRegistration) {
          // Create registration record
          await tx.termRegistration.create({
            data: {
              studentId,
              termId: currentTerm.id
            }
          });

          // Create Semester Fee invoice
          invoicesToCreate.push({
            studentId,
            termId: currentTerm.id,
            amount: billingSettings.defaultFee,
            description: `Semester Registration Fee: ${currentTerm.name}`,
            dueDate: currentTerm.startDate > now ? currentTerm.startDate : dueDate,
            status: 'PENDING'
          });
        }
      }

      // 3. Check for Course Fee
      if (Number(enrollment.course.price) > 0) {
        invoicesToCreate.push({
          studentId,
          enrollmentId: enrollment.id,
          termId: currentTerm?.id,
          amount: enrollment.course.price,
          description: `Course Fee: ${enrollment.course.title}`,
          dueDate: dueDate,
          status: 'PENDING'
        });
      }

      // 4. Create Invoices
      if (invoicesToCreate.length > 0) {
        for (const invData of invoicesToCreate) {
          // Use any for data to bypass strict InvoiceCreateInput if it insists on relations
          await (tx.invoice as any).create({ data: invData });
        }
      }

      return enrollment;
    });

    return successResponse(result, 'Successfully enrolled and invoiced', 201);
  } catch (error) {
    console.error('Enroll course error:', error);
    return errors.internal('Failed to enroll in course');
  }
}
