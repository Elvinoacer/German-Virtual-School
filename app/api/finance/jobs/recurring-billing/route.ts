import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { addMonths, addDays } from 'date-fns';
import { sendInvoiceNotification } from '@/lib/invoice-notification';

/**
 * RECURRING BILLING JOB
 * 
 * This endpoint should be triggered by a Cron job (system) periodically.
 * It identifies the current term, checks if invoices are due based on the
 * global billing cycle, and generates invoices for registered students.
 * 
 * Billing logic:
 * - MONTHLY: Generates an invoice every month for each registered student.
 * - QUARTERLY: Generates one invoice per term (aligned with semester).
 * - ONE_TIME: No recurring invoices, handled manually.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify Request (Secret Key check)
    const secret = request.headers.get('x-cron-secret');
    if (secret !== process.env.CRON_SECRET) {
      console.warn('⚠️ Unauthorized attempt to trigger billing job');
      return errors.unauthorized('Forbidden');
    }

    const now = new Date();
    // console.log(`🚀 Starting Recurring Billing Job at ${now.toISOString()}`); // Use logger instead of console in prod

    // 2. Fetch billing settings and current term
    const [billingSettings, currentTerm] = await Promise.all([
      prisma.globalBillingSettings.findFirst(),
      prisma.academicTerm.findFirst({ where: { isCurrent: true } })
    ]);

    if (!billingSettings) {
      return successResponse({ processed: 0 }, 'No billing settings configured.');
    }

    if (!currentTerm) {
      return successResponse({ processed: 0 }, 'No current term set.');
    }

    const billingCycle = billingSettings.billingCycle;

    // Skip if billing cycle is ONE_TIME (manual only)
    if (billingCycle === 'ONE_TIME') {
      return successResponse({ processed: 0 }, 'Billing cycle is ONE_TIME. No action taken.');
    }

    // 3. Find all students registered for the current term
    const registrations = await prisma.termRegistration.findMany({
      where: { termId: currentTerm.id },
      include: { student: { select: { id: true, firstName: true, lastName: true, email: true } } }
    });

    // console.log(`📋 Found ${registrations.length} students registered for ${currentTerm.name}.`);

    const results = {
      processed: 0,
      invoicesCreated: 0,
      skipped: 0,
      failed: 0
    };

    const feeAmount = Number(billingSettings.defaultFee);
    const shouldRollArrears = billingSettings.lateFeeAction === 'ROLL_TO_NEXT';

    // 4. Process each registered student
    for (const reg of registrations) {
      try {
        // Check if student already has an invoice for this billing period
        let existingInvoice = null;

        if (billingCycle === 'QUARTERLY') {
          existingInvoice = await prisma.invoice.findFirst({
            where: {
              studentId: reg.studentId,
              termId: currentTerm.id,
              description: { contains: 'Semester Fee' }
            }
          });
        } else if (billingCycle === 'MONTHLY') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          existingInvoice = await prisma.invoice.findFirst({
            where: {
              studentId: reg.studentId,
              termId: currentTerm.id,
              createdAt: { gte: startOfMonth, lte: endOfMonth }
            }
          });
        }

        if (existingInvoice) {
          results.skipped++;
          continue;
        }

        // Calculate total amount (base fee + arrears if applicable)
        let totalAmount = feeAmount;
        const dueDate = addDays(now, 14); // 14 day grace period
        const cycleLabel = billingCycle === 'MONTHLY' ? 'Monthly Fee' : 'Semester Fee';
        
        let newInvoiceData = null;

        await prisma.$transaction(async (tx) => {
            if (shouldRollArrears) {
            const overdueInvoices = await tx.invoice.findMany({
                where: {
                studentId: reg.studentId,
                status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
                dueDate: { lt: now }
                },
                select: { id: true, amount: true, paidAmount: true }
            });

            for (const oldInvoice of overdueInvoices) {
                const arrears = Number(oldInvoice.amount) - Number(oldInvoice.paidAmount);
                if (arrears > 0) {
                totalAmount += arrears;
                // Mark old invoice as rolled over
                await tx.invoice.update({
                    where: { id: oldInvoice.id },
                    data: { status: 'PAID', description: `Rolled over to ${currentTerm.name}` }
                });
                }
            }
            }

            // Create the new invoice
            const description = `${cycleLabel}: ${currentTerm.name}${totalAmount > feeAmount ? ' (includes arrears)' : ''}`;

            const invoice = await (tx.invoice as any).create({
            data: {
                studentId: reg.studentId,
                termId: currentTerm.id,
                amount: totalAmount,
                description,
                dueDate,
                status: 'PENDING'
            }
            });
            
            newInvoiceData = {
                id: invoice.id,
                amount: totalAmount,
                description,
                dueDate,
                createdAt: now,
                studentName: `${reg.student.firstName} ${reg.student.lastName}`,
                studentEmail: reg.student.email
            };
        });

        if (newInvoiceData) {
            // Send notification (non-blocking)
            sendInvoiceNotification(newInvoiceData).catch(err => console.error('Failed to send notification', err));
            results.invoicesCreated++;
        }
        
        results.processed++;

      } catch (err) {
        console.error(`❌ Failed to process student ${reg.studentId}:`, err);
        results.failed++;
      }
    }

    return successResponse(results, `Billing job completed. Invoices Created: ${results.invoicesCreated}`);

  } catch (error) {
    console.error('Job Error:', error);
    return errors.internal('Failed to run billing job');
  }
}


