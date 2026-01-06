import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { IntaSendService } from '@/lib/intasend';

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    if (payload.role !== 'STUDENT') {
      return errors.forbidden('Only students can make payments');
    }

    const { invoiceId, amount } = await request.json();

    if (!invoiceId || !amount) {
      return errors.badRequest('Missing invoiceId or amount');
    }

    // Get invoice with student details
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { student: true }
    });

    if (!invoice || invoice.studentId !== payload.id) {
      return errors.notFound('Invoice not found');
    }

    // Check if already paid
    if (invoice.status === 'PAID') {
      return errors.badRequest('Invoice already paid');
    }

    const remainingAmount = Number(invoice.amount) - Number(invoice.paidAmount);

    if (amount > remainingAmount) {
      return errors.badRequest(`Amount exceeds remaining balance of ${remainingAmount}`);
    }

    // Create IntaSend checkout link
    const checkoutData = await IntaSendService.createCheckoutLink({
      first_name: invoice.student.firstName || 'Student',
      last_name: invoice.student.lastName || '',
      email: invoice.student.email,
      host: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      amount: Number(amount),
      currency: 'KES',
      api_ref: invoiceId,
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/student/billing?payment=success`,
      mobile_tarrif: 'BUSINESS-PAYS',
      card_tarrif: 'BUSINESS-PAYS'
    });

    return successResponse({
      checkoutUrl: checkoutData.url,
      checkoutId: checkoutData.id
    }, 'Checkout link created successfully');

  } catch (error: any) {
    console.error('Payment init error:', error);
    return errors.internal(error.message || 'Failed to initiate payment');
  }
}
