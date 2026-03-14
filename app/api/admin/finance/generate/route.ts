import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { sendInvoiceNotification } from '@/lib/invoice-notification';

/**
 * POST /api/admin/finance/generate
 * 
 * Manually generate semester invoices for all students registered
 * in the current term who do not yet have an invoice.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Access denied');
    }

    // 1. Get current term and billing settings
    const [currentTerm, billingSettings] = await Promise.all([
      prisma.academicTerm.findFirst({ where: { isCurrent: true } }),
      prisma.globalBillingSettings.findFirst()
    ]);

    if (!currentTerm) {
      return errors.badRequest('No active semester found. Please set a current term first.');
    }

    if (!billingSettings || Number(billingSettings.defaultFee) <= 0) {
      return errors.badRequest('Default fee is not configured or is zero.');
    }

    // 2. Get all students registered for the current term with details
    const registrations = await prisma.termRegistration.findMany({
      where: { termId: currentTerm.id },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    if (registrations.length === 0) {
      return successResponse({ created: 0, skipped: 0 }, 'No students are registered for the current term.');
    }

    const students = registrations.map(r => r.student);
    const studentIds = students.map(s => s.id);

    // 3. Find students who already have an invoice for this term
    const existingInvoices = await prisma.invoice.findMany({
      where: {
        termId: currentTerm.id,
        studentId: { in: studentIds }
      },
      select: { studentId: true }
    });

    const studentsWithInvoice = new Set(existingInvoices.map(i => i.studentId));
    const studentsNeedingInvoice = students.filter(s => !studentsWithInvoice.has(s.id));

    if (studentsNeedingInvoice.length === 0) {
      return successResponse(
        { created: 0, skipped: studentIds.length },
        'All registered students already have invoices for this term.'
      );
    }

    // 4. Handle arrears if lateFeeAction is ROLL_TO_NEXT
    const shouldRollArrears = billingSettings.lateFeeAction === 'ROLL_TO_NEXT';

    // 5. Create invoices in a transaction
    const now = new Date();
    const dueDate = new Date(currentTerm.startDate > now ? currentTerm.startDate : now);
    dueDate.setDate(dueDate.getDate() + 14); // 14 day grace period

    // Store data for notifications
    const invoicesForNotification: any[] = [];

    await prisma.$transaction(async (tx) => {
      for (const student of studentsNeedingInvoice) {
        let totalAmount = Number(billingSettings.defaultFee);

        // Check for arrears from previous term if applicable
        if (shouldRollArrears) {
          const previousOverdueInvoices = await tx.invoice.findMany({
            where: {
              studentId: student.id,
              status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
              termId: { not: currentTerm.id },
              dueDate: { lt: now }
            },
            select: { id: true, amount: true, paidAmount: true }
          });

          for (const oldInvoice of previousOverdueInvoices) {
            const arrears = Number(oldInvoice.amount) - Number(oldInvoice.paidAmount);
            if (arrears > 0) {
              totalAmount += arrears;
              // Mark old invoice as rolled over (set to PAID with note)
              await tx.invoice.update({
                where: { id: oldInvoice.id },
                data: {
                  status: 'PAID',
                  description: `Rolled over to ${currentTerm.name}`
                }
              });
            }
          }
        }

        // Check for seat reservation & material fee credits
        let deductions = 0;
        const deductionNotes: string[] = [];

        // Check for PAID seat reservation
        const paidReservation = await tx.seatReservation.findFirst({
          where: {
            userId: student.id,
            status: 'PAID',
          },
          select: { amount: true },
        });

        if (paidReservation) {
          deductions += Number(paidReservation.amount);
          deductionNotes.push(`seat reservation $${Number(paidReservation.amount).toLocaleString()}`);
        }

        // Check for PAID material fee invoice
        const paidMaterialInvoice = await tx.invoice.findFirst({
          where: {
            studentId: student.id,
            description: { contains: 'Learning Material Fee' },
            status: 'PAID',
          },
          select: { amount: true },
        });

        if (paidMaterialInvoice) {
          deductions += Number(paidMaterialInvoice.amount);
          deductionNotes.push(`material fee $${Number(paidMaterialInvoice.amount).toLocaleString()}`);
        }

        totalAmount = Math.max(0, totalAmount - deductions);

        let description = `Semester Fee: ${currentTerm.name}`;
        if (totalAmount > Number(billingSettings.defaultFee) - deductions && shouldRollArrears) {
          description += ' (includes arrears)';
        }
        if (deductionNotes.length > 0) {
          description += ` (less ${deductionNotes.join(' & ')})`;
        }

        const newInvoice = await (tx.invoice as any).create({
          data: {
            studentId: student.id,
            termId: currentTerm.id,
            amount: totalAmount,
            description,
            dueDate,
            status: 'PENDING'
          }
        });
        
        invoicesForNotification.push({
          id: newInvoice.id,
          amount: totalAmount,
          description,
          dueDate,
          createdAt: now,
          studentName: `${student.firstName} ${student.lastName}`,
          studentEmail: student.email,
          studentId: student.id
        });
      }
    });

    // 6. Send Notifications (Fire and forget, don't block response)
    Promise.allSettled(
      invoicesForNotification.map(invoice => sendInvoiceNotification(invoice))
    );

    return successResponse(
      { created: invoicesForNotification.length, skipped: studentsWithInvoice.size },
      `Successfully generated ${invoicesForNotification.length} invoices for ${currentTerm.name}.`
    );

  } catch (error) {
    console.error('Generate invoices error:', error);
    return errors.internal('Failed to generate invoices');
  }
}
