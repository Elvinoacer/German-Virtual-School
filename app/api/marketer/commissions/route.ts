import { NextRequest, NextResponse } from "next/server";
import { authenticateMarketer } from "@/lib/marketer-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const marketer = await authenticateMarketer(request);
    
    const commissions = await prisma.referralCommission.findMany({
      where: { marketerId: marketer.id },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json({ success: true, data: commissions });
  } catch (error: any) {
    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch commissions" }, { status: 500 });
  }
}
