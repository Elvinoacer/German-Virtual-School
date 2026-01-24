import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

/**
 * RECURRING BILLING JOB
 * 
 * This endpoint should be triggered by a Cron job (system) once a day.
 * It identifies enrollments due for their next billing cycle and generates invoices.
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
    console.log(`🚀 Starting Recurring Billing Job at ${now.toISOString()}`);

    // 2. Find eligible enrollments
    // Status: ACTIVE
    // nextBillingDate: <= now
    // billingCycle: NOT ONE_TIME
    const dueEnrollments = await prisma.enrollment.findMany({
      where: {
        status: 'ACTIVE',
        billingCycle: { in: ['MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL'] },
        nextBillingDate: { lte: now },
      },
      include: {
        course: true,
        student: true,
        // Include fee plan if it exists
        // (Note: feePlanId was added to schema, using it to get correct amount)
      }
    });

    console.log(`📋 Found ${dueEnrollments.length} enrollments due for billing.`);

    const results = {
      processed: 0,
      failed: 0,
      invoicesCreated: 0,
    };

    // 3. Process each enrollment
    for (const enrollment of dueEnrollments) {
      try {
        await prisma.$transaction(async (tx) => {
          // A. Fetch the specific FeePlan if linked
          let amount = enrollment.course.price;
          let installmentsLimit = null;
          
          if (enrollment.feePlanId) {
            const plan = await tx.feePlan.findUnique({ where: { id: enrollment.feePlanId } });
            if (plan) {
              amount = plan.amount;
              installmentsLimit = plan.installments;
            }
          }

          // B. Check installment limits (if applicable)
          if (installmentsLimit && installmentsLimit > 0) {
              const existingInvoicesCount = await tx.invoice.count({
                  where: { enrollmentId: enrollment.id }
              });
              
              if (existingInvoicesCount >= installmentsLimit) {
                  console.log(`🛑 Limit reached for enrollment ${enrollment.id}. Disabling further billing.`);
                  await tx.enrollment.update({
                      where: { id: enrollment.id },
                      data: { nextBillingDate: null }
                  });
                  return; // Skip this one
              }
          }

          // C. Create the new invoice
          const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 day grace period
          
          await (tx.invoice as any).create({
            data: {
              studentId: enrollment.studentId,
              enrollmentId: enrollment.id,
              amount: amount,
              description: `Recurring Fee: ${enrollment.course.title} (${enrollment.billingCycle} Cycle)`,
              dueDate: dueDate,
              status: 'PENDING',
            }
          });

          // D. Advance next billing date
          const nextDate = new Date(enrollment.nextBillingDate!);
          if (enrollment.billingCycle === 'MONTHLY') nextDate.setMonth(nextDate.getMonth() + 1);
          else if (enrollment.billingCycle === 'QUARTERLY') nextDate.setMonth(nextDate.getMonth() + 3);
          else if (enrollment.billingCycle === 'ANNUAL') nextDate.setFullYear(nextDate.getFullYear() + 1);
          else nextDate.setMonth(nextDate.getMonth() + 6); // Biannual

          await tx.enrollment.update({
            where: { id: enrollment.id },
            data: { nextBillingDate: nextDate }
          });

          results.invoicesCreated++;
        });

        results.processed++;
      } catch (err) {
        console.error(`❌ Failed to process enrollment ${enrollment.id}:`, err);
        results.failed++;
      }
    }

    return successResponse(results, `Billing job completed. Processed: ${results.processed}, Invoices Created: ${results.invoicesCreated}`);

  } catch (error) {
    console.error('Job Error:', error);
    return errors.internal('Failed to run billing job');
  }
}
