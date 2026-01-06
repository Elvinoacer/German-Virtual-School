import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { IntaSendService } from '@/lib/intasend';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== 'STUDENT') {
      return errors.forbidden('Only students can make payments');
    }

    const { invoiceId } = await params;

    // Get invoice with student details
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        student: true,
        enrollment: {
          include: {
            course: true
          }
        }
      }
    });

    if (!invoice) {
      return errors.notFound('Invoice not found');
    }

    if (invoice.studentId !== payload.userId) {
      return errors.forbidden('Not authorized to pay this invoice');
    }

    // Check if already paid
    if (invoice.status === 'PAID') {
      return errors.badRequest('Invoice already paid');
    }

    const body = await request.json();
    const { amount, method } = body;

    // Calculate remaining amount
    const remainingAmount = Number(invoice.amount) - Number(invoice.paidAmount);

    if (!amount || amount <= 0) {
      return errors.badRequest('Invalid payment amount');
    }

    if (amount > remainingAmount) {
      return errors.badRequest(`Amount exceeds remaining balance of ${remainingAmount}`);
    }

    // Create checkout link with IntaSend
    const checkoutData = await IntaSendService.createCheckoutLink({
      first_name: invoice.student.firstName || 'Student',
      last_name: invoice.student.lastName || '',
      email: invoice.student.email,
      host: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      amount: Number(amount),
      currency: 'KES',
      api_ref: invoiceId, // Pass our invoice ID for webhook callback
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student/billing?payment=success`,
      method: method as 'M-PESA' | 'CARD-PAYMENT' | undefined,
      mobile_tarrif: 'BUSINESS-PAYS',
      card_tarrif: 'BUSINESS-PAYS'
    });

    // Map IntaSend method to Prisma PaymentMethod enum
    let paymentMethodEnum = 'MOBILE_MONEY'; 
    if (method === 'M-PESA') {
      paymentMethodEnum = 'MPESA';
    } else if (method === 'CARD-PAYMENT') {
      paymentMethodEnum = 'CARD';
    }

    // Optionally create a pending payment record to track the initiation
    // The actual payment will be created/updated by the webhook
    await prisma.payment.create({
      data: {
        invoiceId,
        amount: Number(amount),
        method: paymentMethodEnum as any,
        transactionReference: `PENDING_${checkoutData.id}`,
        status: 'PENDING',
        metadata: {
          checkout_id: checkoutData.id,
          initiated_at: new Date().toISOString()
        } as any
      }
    });

    return successResponse({
      checkoutUrl: checkoutData.url,
      checkoutId: checkoutData.id,
      amount: Number(amount),
      invoice: {
        id: invoice.id,
        totalAmount: Number(invoice.amount),
        paidAmount: Number(invoice.paidAmount),
        remainingAmount
      }
    }, 'Payment checkout created successfully');

  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return errors.internal(error.message || 'Failed to initiate payment');
  }
}
