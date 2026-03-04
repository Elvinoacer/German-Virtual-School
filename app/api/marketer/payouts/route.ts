import { NextRequest, NextResponse } from "next/server";
import { authenticateMarketer } from "@/lib/marketer-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const marketer = await authenticateMarketer(request);
    
    const payouts = await prisma.commissionPayout.findMany({
      where: { marketerId: marketer.id },
      include: {
        commissions: { select: { studentName: true, amount: true, type: true } }
      },
      orderBy: { paidAt: "desc" },
    });
    
    return NextResponse.json({ success: true, data: payouts });
  } catch (error: any) {
    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 });
  }
}
