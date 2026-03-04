import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { IntaSendService, type IntaSendWebhookPayload } from '@/lib/intasend';
import { sendEmailNotification } from '@/lib/notifications/channels/email';

export async function POST(request: NextRequest) {
  try {
    const body: IntaSendWebhookPayload = await request.json();
    
    console.log('📥 IntaSend Webhook Received:', {
      invoice_id: body.invoice_id,
      state: body.state,
      api_ref: body.api_ref,
      amount: body.value,
      provider: body.provider
    });

    // Verify webhook authenticity using challenge field
    if (!IntaSendService.verifyWebhook(body)) {
      console.error('❌ Invalid webhook challenge');
      return errors.forbidden('Invalid webhook signature');
    }

    // Extract payment details
    const {
      invoice_id: intasendInvoiceId,
      state,
      value,
      api_ref: apiRef, // Our internal reference (invoiceId or SEAT_reservationId)
      provider,
      failed_reason,
      net_amount,
      charges
    } = body;

    // Detect if this is a seat reservation payment
    const isSeatReservation = apiRef.startsWith('SEAT_');

    // Handle payment based on state
    switch (state) {
      case 'COMPLETE':
        if (isSeatReservation) {
          await handleSeatReservationPayment({
            reservationId: apiRef.replace('SEAT_', ''),
            intasendInvoiceId,
            paidAmount: parseFloat(value),
            provider,
          });
        } else {
          await handleCompletePayment({
            invoiceId: apiRef,
            intasendInvoiceId,
            paidAmount: parseFloat(value),
            netAmount: parseFloat(net_amount),
            charges: parseFloat(charges),
            provider
          });
        }
        break;

      case 'FAILED':
        if (isSeatReservation) {
          const reservationId = apiRef.replace('SEAT_', '');
          await prisma.seatReservation.update({
            where: { id: reservationId },
            data: { status: 'EXPIRED' },
          }).catch(() => console.warn(`Could not update reservation ${reservationId}`));
        } else {
          await handleFailedPayment({
            invoiceId: apiRef,
            intasendInvoiceId,
            failedReason: failed_reason || 'Unknown error'
          });
        }
        break;

      case 'PROCESSING':
        console.log(`⏳ Payment processing for ${apiRef}`);
        break;

      case 'PENDING':
        console.log(`⏸️  Payment pending for ${apiRef}`);
        break;

      default:
        console.warn(`⚠️  Unknown payment state: ${state}`);
    }

    return successResponse({ received: true, state });
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    return errors.internal('Webhook processing failed');
  }
}

/**
 * Handle successful seat reservation payment
 */
async function handleSeatReservationPayment({
  reservationId,
  intasendInvoiceId,
  paidAmount,
  provider,
}: {
  reservationId: string;
  intasendInvoiceId: string;
  paidAmount: number;
  provider: string;
}) {
  console.log(`🪑 Processing seat reservation payment for ${reservationId}`);

  const reservation = await prisma.seatReservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    console.warn(`⚠️  Seat reservation ${reservationId} not found`);
    return;
  }

  if (reservation.status === 'PAID') {
    console.log(`ℹ️  Seat reservation ${reservationId} already paid`);
    return;
  }

  // Update reservation status to PAID
  await prisma.seatReservation.update({
    where: { id: reservationId },
    data: { status: 'PAID' },
  });

  console.log(`✅ Seat reservation ${reservationId} marked as PAID`);

  // Create referral commission if marketer linked
  if (reservation.marketerId) {
    try {
      const settings = await prisma.systemSettings.findUnique({
        where: { id: 'system-settings' },
        select: { reservationCommission: true },
      });
      const commissionAmount = settings?.reservationCommission ? Number(settings.reservationCommission) : 500;

      await prisma.referralCommission.create({
        data: {
          marketerId: reservation.marketerId,
          studentEmail: reservation.email,
          studentName: `${reservation.firstName} ${reservation.lastName}`,
          type: 'RESERVATION',
          amount: commissionAmount,
          status: 'EARNED',
        },
      });
      console.log(`💰 Reservation commission (KSH ${commissionAmount}) created for marketer ${reservation.marketerId}`);
    } catch (commErr) {
      console.error('Failed to create reservation commission (non-fatal):', commErr);
    }
  }

  // Send confirmation email
  try {
    await sendEmailNotification({
      userId: reservation.userId || 'system',
      title: 'Seat Reservation Confirmed — German Virtual School',
      message: `Your seat for the ${reservation.intakeLabel} intake has been confirmed.`,
      email: {
        to: reservation.email,
        subject: 'Seat Reservation Confirmed — German Virtual School',
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a4d8f;">Seat Reserved Successfully! 🎉</h1>
            <p>Dear ${reservation.firstName},</p>
            <p>Your seat for the <strong>${reservation.intakeLabel}</strong> intake at German Virtual School has been confirmed.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px; color: #1a4d8f;">Reservation Details</h3>
              <p style="margin: 4px 0;"><strong>Name:</strong> ${reservation.firstName} ${reservation.lastName}</p>
              ${reservation.program ? `<p style="margin: 4px 0;"><strong>Program:</strong> ${reservation.program}</p>` : ''}
              <p style="margin: 4px 0;"><strong>Amount Paid:</strong> KSH ${paidAmount.toLocaleString()}</p>
              <p style="margin: 4px 0;"><strong>Status:</strong> ✅ Confirmed</p>
            </div>
            
            <div style="background: #fff3cd; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; font-size: 14px;"><strong>What's Next?</strong></p>
              <ul style="margin: 8px 0 0; padding-left: 20px; font-size: 14px;">
                <li>Your KSH ${paidAmount.toLocaleString()} will be deducted from your total tuition.</li>
                <li>You'll be notified about <strong>learning material fees (KSH 7,500)</strong> closer to the class start date.</li>
                <li>Create your student account at <a href="${process.env.NEXT_PUBLIC_APP_URL}/register" style="color: #1a4d8f;">our registration page</a> to access the full platform.</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              This is a non-refundable reservation fee. If you have any questions, contact us at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@germanvirtualschool.com'}.
            </p>
          </div>
        `,
      },
    });
    console.log(`📧 Confirmation email sent to ${reservation.email}`);
  } catch (emailErr) {
    console.error('Failed to send seat reservation confirmation email:', emailErr);
  }

  // Send admin notification
  try {
    const adminEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'admin@germanvirtualschool.com';
    await sendEmailNotification({
      userId: 'system',
      title: 'New Seat Reservation — Admin Notification',
      message: `A new seat reservation has been confirmed.`,
      email: {
        to: adminEmail,
        subject: `🪑 New Seat Reservation: ${reservation.firstName} ${reservation.lastName}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a4d8f;">New Seat Reservation Received</h1>
            <p>A new student has reserved their seat for the <strong>${reservation.intakeLabel}</strong> intake.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px; color: #1a4d8f;">Student Details</h3>
              <p style="margin: 4px 0;"><strong>Name:</strong> ${reservation.firstName} ${reservation.lastName}</p>
              <p style="margin: 4px 0;"><strong>Email:</strong> ${reservation.email}</p>
              ${reservation.phone ? `<p style="margin: 4px 0;"><strong>Phone:</strong> ${reservation.phone}</p>` : ''}
              ${reservation.program ? `<p style="margin: 4px 0;"><strong>Program:</strong> ${reservation.program}</p>` : ''}
              <p style="margin: 4px 0;"><strong>Amount Paid:</strong> KSH ${paidAmount.toLocaleString()}</p>
              <p style="margin: 4px 0;"><strong>Payment Provider:</strong> ${provider}</p>
              <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}</p>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              This is an automated notification from the German Virtual School system.
            </p>
          </div>
        `,
      },
    });
    console.log(`📧 Admin notification sent to ${adminEmail}`);
  } catch (adminEmailErr) {
    console.error('Failed to send admin notification (non-fatal):', adminEmailErr);
  }
}

/**
 * Handle successful payment
 */
async function handleCompletePayment({
  invoiceId,
  intasendInvoiceId,
  paidAmount,
  netAmount,
  charges,
  provider
}: {
  invoiceId: string;
  intasendInvoiceId: string;
  paidAmount: number;
  netAmount: number;
  charges: number;
  provider: string;
}) {
  console.log(`✅ Processing completed payment for invoice ${invoiceId}`);

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId }
  });

  if (!invoice) {
    console.warn(`⚠️  Invoice ${invoiceId} not found for payment ${intasendInvoiceId}`);
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Check if payment already recorded (prevent duplicates)
    const existingPayment = await tx.payment.findUnique({
      where: { transactionReference: intasendInvoiceId }
    });

    if (existingPayment) {
      console.log(`ℹ️  Payment ${intasendInvoiceId} already recorded`);
      return;
    }

    // Determine payment method enum strictly matching Prisma schema (MPESA or CARD)
    // IntaSend sends "M-PESA" or "CARD-PAYMENT"
    const methodEnum = provider.replace('-', '').toUpperCase().includes('MPESA') ? 'MPESA' : 'CARD';

    // Check for pending payment to update
    // Initiation creates record with "PENDING_" prefix
    const pendingPayment = await tx.payment.findUnique({
        where: { transactionReference: `PENDING_${intasendInvoiceId}` }
    });

    if (pendingPayment) {
        // Update existing pending payment
        await tx.payment.update({
            where: { id: pendingPayment.id },
            data: {
                transactionReference: intasendInvoiceId, // Remove PENDING prefix to finalize
                status: 'PAID',
                method: methodEnum as any,
                metadata: {
                    net_amount: netAmount,
                    charges: charges,
                    provider: provider
                } as any
            }
        });
        console.log(`✅ Updated pending payment ${pendingPayment.id} to PAID`);
    } else {
        // Create new payment record if no pending one found
        await tx.payment.create({
            data: {
                invoiceId,
                amount: paidAmount,
                method: methodEnum as any,
                transactionReference: intasendInvoiceId,
                status: 'PAID',
                metadata: {
                    net_amount: netAmount,
                    charges: charges,
                    provider: provider
                } as any
            }
        });
        console.log(`✅ Created new payment record for ${intasendInvoiceId}`);
    }

    // Update invoice status
    const newPaidAmount = Number(invoice.paidAmount) + paidAmount;
    const newStatus = newPaidAmount >= Number(invoice.amount) ? 'PAID' : 'PARTIAL';

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus
      }
    });

    console.log(`✅ Invoice ${invoiceId} updated: ${paidAmount}, new status: ${newStatus}`);

    // Create full payment commission if student has a linked marketer and invoice is fully paid
    if (newStatus === 'PAID') {
      try {
        // Find student's seat reservation with a marketer
        const studentReservation = await tx.seatReservation.findFirst({
          where: {
            userId: invoice.studentId,
            status: 'PAID',
            marketerId: { not: null },
          },
          select: { marketerId: true, email: true, firstName: true, lastName: true },
        });

        if (studentReservation?.marketerId) {
          // Check if FULL_PAYMENT commission already exists for this student
          const existingCommission = await tx.referralCommission.findFirst({
            where: {
              marketerId: studentReservation.marketerId,
              studentEmail: studentReservation.email,
              type: 'FULL_PAYMENT',
            },
          });

          if (!existingCommission) {
            const settings = await prisma.systemSettings.findUnique({
              where: { id: 'system-settings' },
              select: { fullPaymentCommission: true },
            });
            const commissionAmount = settings?.fullPaymentCommission ? Number(settings.fullPaymentCommission) : 1500;

            await tx.referralCommission.create({
              data: {
                marketerId: studentReservation.marketerId,
                studentEmail: studentReservation.email,
                studentName: `${studentReservation.firstName} ${studentReservation.lastName}`,
                type: 'FULL_PAYMENT',
                amount: commissionAmount,
                status: 'EARNED',
              },
            });
            console.log(`💰 Full payment commission (KSH ${commissionAmount}) created for marketer ${studentReservation.marketerId}`);
          }
        }
      } catch (commErr) {
        console.error('Failed to create full payment commission (non-fatal):', commErr);
      }
    }
  });
}

/**
 * Handle failed payment
 */
async function handleFailedPayment({
  invoiceId,
  intasendInvoiceId,
  failedReason
}: {
  invoiceId: string;
  intasendInvoiceId: string;
  failedReason: string;
}) {
  console.log(`❌ Payment failed for invoice ${invoiceId}: ${failedReason}`);

  // Update any pending payment records
  // We need to look for the "PENDING_" prefix used during initiation
  await prisma.payment.updateMany({
    where: {
      invoiceId,
      transactionReference: `PENDING_${intasendInvoiceId}`,
      status: 'PENDING'
    },
    data: {
      status: 'FAILED',
      metadata: {
        failed_reason: failedReason
      } as any
    }
  });
}
