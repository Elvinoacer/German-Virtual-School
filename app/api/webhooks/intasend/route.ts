import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { IntaSendService, type IntaSendWebhookPayload } from '@/lib/intasend';

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
      api_ref: invoiceId, // Our internal invoice ID
      provider,
      failed_reason,
      net_amount,
      charges
    } = body;

    // Handle payment based on state
    switch (state) {
      case 'COMPLETE':
        await handleCompletePayment({
          invoiceId,
          intasendInvoiceId,
          paidAmount: parseFloat(value),
          netAmount: parseFloat(net_amount),
          charges: parseFloat(charges),
          provider
        });
        break;

      case 'FAILED':
        await handleFailedPayment({
          invoiceId,
          intasendInvoiceId,
          failedReason: failed_reason || 'Unknown error'
        });
        break;

      case 'PROCESSING':
        console.log(`⏳ Payment processing for invoice ${invoiceId}`);
        break;

      case 'PENDING':
        console.log(`⏸️  Payment pending for invoice ${invoiceId}`);
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
