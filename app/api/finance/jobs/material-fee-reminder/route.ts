import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { addWeeks, isBefore, isAfter, endOfDay } from 'date-fns';
import { sendInvoiceNotification } from '@/lib/invoice-notification';

const DEFAULT_MATERIAL_FEE = 7500;

/**
 * MATERIAL FEE REMINDER JOB
 * 
 * This endpoint should be triggered by a Cron job daily.
 * It checks if we are within 3 weeks of the firstClassDate
 * and creates material fee invoices for all PAID seat reservations
 * that don't already have a material fee invoice.
 * 
 * Material fee: KSH 7,500 (configurable in SystemSettings)
 * Deadline: materialFeeDeadline from settings (or end of April)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify cron secret
    const secret = request.headers.get('x-cron-secret');
    if (secret !== process.env.CRON_SECRET) {
      console.warn('⚠️ Unauthorized attempt to trigger material fee job');
      return errors.unauthorized('Forbidden');
    }

    const now = new Date();

    // 2. Fetch system settings
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'system-settings' },
      select: {
        firstClassDate: true,
        materialFee: true,
        materialFeeDeadline: true,
        intakeLabel: true,
      },
    });

    if (!settings?.firstClassDate) {
      return successResponse({ processed: 0 }, 'No firstClassDate set in system settings.');
    }

    // 3. Check if we are within 3 weeks of firstClassDate
    const threeWeeksBefore = addWeeks(settings.firstClassDate, -3);

    if (isBefore(now, threeWeeksBefore)) {
      return successResponse(
        { processed: 0 },
        `Too early. Material fee reminders start on ${threeWeeksBefore.toISOString().split('T')[0]}.`
      );
    }

    if (isAfter(now, settings.firstClassDate)) {
      return successResponse(
        { processed: 0 },
        'Classes have already started. No material fee reminders needed.'
      );
    }

    const materialFee = settings.materialFee
      ? Number(settings.materialFee)
      : DEFAULT_MATERIAL_FEE;

    // Default deadline: end of April of the current year
    const materialFeeDeadline = settings.materialFeeDeadline
      || endOfDay(new Date(now.getFullYear(), 3, 30)); // April 30

    const intakeLabel = settings.intakeLabel || 'May 2026';

    // 4. Find all PAID seat reservations that need material fee invoices
    const paidReservations = await prisma.seatReservation.findMany({
      where: {
        status: 'PAID',
        intakeLabel,
      },
    });

    const results = {
      processed: 0,
      invoicesCreated: 0,
      skipped: 0,
      failed: 0,
    };

    for (const reservation of paidReservations) {
      try {
        // Check if material fee invoice already exists for this email
        // We look for invoices with the material fee description
        const existingInvoice = await prisma.invoice.findFirst({
          where: {
            description: { contains: 'Learning Material Fee' },
            student: { email: reservation.email },
          },
        });

        if (existingInvoice) {
          results.skipped++;
          results.processed++;
          continue;
        }

        // We need a user account to create an invoice.
        // Try to find a user with the same email.
        let user = await prisma.user.findUnique({
          where: { email: reservation.email },
          select: { id: true, firstName: true, lastName: true, email: true },
        });

        if (!user) {
          // No account yet — send a standalone notification email instead
          const { sendEmailNotification } = await import('@/lib/notifications/channels/email');
          
          await sendEmailNotification({
            userId: 'system',
            title: 'Learning Material Fee — German Virtual School',
            message: `Your learning material fee of KSH ${materialFee.toLocaleString()} is due.`,
            email: {
              to: reservation.email,
              subject: 'Learning Material Fee Due — German Virtual School',
              html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #1a4d8f;">Learning Material Fee</h1>
                  <p>Dear ${reservation.firstName},</p>
                  <p>Thank you for reserving your seat for the <strong>${intakeLabel}</strong> intake. To complete your preparation, we require a learning material fee.</p>
                  
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin: 0 0 12px; color: #1a4d8f;">Fee Details</h3>
                    <p style="margin: 4px 0;"><strong>Amount:</strong> KSH ${materialFee.toLocaleString()}</p>
                    <p style="margin: 4px 0;"><strong>Purpose:</strong> Purchase of learning materials</p>
                    <p style="margin: 4px 0;"><strong>Deadline:</strong> ${materialFeeDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p style="margin: 4px 0;"><strong>Note:</strong> This will be deducted from your total tuition fee.</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/register" 
                       style="display: inline-block; padding: 14px 32px; background-color: #1a4d8f; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                      Create Account & Pay
                    </a>
                  </div>
                  
                  <p style="color: #666; font-size: 14px;">
                    Please create your student account first, then go to your billing page to make the payment.
                  </p>
                  
                  <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                    If you have any questions, contact us at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@germanvirtualschool.com'}.
                  </p>
                </div>
              `,
            },
          });

          results.invoicesCreated++; // Count as processed even without invoice
          results.processed++;
          continue;
        }

        // Link reservation to user if not already linked
        if (!reservation.userId) {
          await prisma.seatReservation.update({
            where: { id: reservation.id },
            data: { userId: user.id },
          });
        }

        // Create invoice for material fee
        const invoice = await prisma.invoice.create({
          data: {
            studentId: user.id,
            amount: materialFee,
            description: `Learning Material Fee: ${intakeLabel}`,
            dueDate: materialFeeDeadline,
            status: 'PENDING',
          },
        });

        // Send notification with invoice PDF
        await sendInvoiceNotification({
          id: invoice.id,
          amount: materialFee,
          description: invoice.description,
          dueDate: materialFeeDeadline,
          createdAt: now,
          studentName: `${user.firstName} ${user.lastName}`,
          studentEmail: user.email,
          studentId: user.id,
        }).catch((err) =>
          console.error(`Failed to send material fee notification to ${user!.email}:`, err)
        );

        results.invoicesCreated++;
        results.processed++;
      } catch (err) {
        console.error(`❌ Failed to process reservation ${reservation.id}:`, err);
        results.failed++;
        results.processed++;
      }
    }

    return successResponse(
      results,
      `Material fee job completed. Invoices/Notifications: ${results.invoicesCreated}, Skipped: ${results.skipped}`
    );
  } catch (error) {
    console.error('Material fee job error:', error);
    return errors.internal('Failed to run material fee job');
  }
}
