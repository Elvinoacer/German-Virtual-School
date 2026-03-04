import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth-middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ marketerId: string }> }
) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { marketerId } = await params;
    const { amount, transactionReference, payoutMethod, commissionIds } = await request.json();

    if (!amount || amount <= 0 || !transactionReference || !payoutMethod) {
      return NextResponse.json({ error: "Invalid payment details" }, { status: 400 });
    }

    // Process payout transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the payout record
      const payout = await tx.commissionPayout.create({
        data: {
          marketerId,
          amount,
          transactionReference,
          payoutMethod,
        },
      });

      let commissionsToUpdate;
      
      if (commissionIds && Array.isArray(commissionIds) && commissionIds.length > 0) {
        commissionsToUpdate = await tx.referralCommission.findMany({
          where: { id: { in: commissionIds }, marketerId, status: 'EARNED' },
        });
      } else {
        // Fallback: update all EARNED commissions up to this amount (simplistic approach)
        // Usually, the frontend should send exactly which commissions are being paid
        commissionsToUpdate = await tx.referralCommission.findMany({
          where: { marketerId, status: 'EARNED' },
        });
      }

      if (commissionsToUpdate.length > 0) {
        await tx.referralCommission.updateMany({
          where: { id: { in: commissionsToUpdate.map(c => c.id) } },
          data: { status: 'PAID' },
        });
      }

      return payout;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to process payout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
