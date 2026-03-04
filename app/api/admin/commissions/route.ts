import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const marketerId = searchParams.get("marketerId");

    const where: any = {};
    if (status) where.status = status;
    if (marketerId) where.marketerId = marketerId;

    const commissions = await prisma.referralCommission.findMany({
      where,
      include: {
        marketer: { select: { id: true, firstName: true, lastName: true, email: true, payoutMethod: true, payoutDetails: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: commissions });
  } catch (error) {
    console.error("Failed to fetch commissions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedCommission = await prisma.referralCommission.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updatedCommission });
  } catch (error) {
    console.error("Failed to update commission:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
