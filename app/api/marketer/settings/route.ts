import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateMarketer } from "@/lib/marketer-auth";

export async function GET(request: NextRequest) {
  try {
    const marketerPayload = await authenticateMarketer(request);
    if (!marketerPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketer = await prisma.marketer.findUnique({
      where: { id: marketerPayload.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        payoutMethod: true,
        payoutDetails: true,
        termsAcceptedAt: true,
      },
    });

    if (!marketer) {
      return NextResponse.json({ error: "Marketer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: marketer });
  } catch (error) {
    console.error("Failed to fetch marketer settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const marketerPayload = await authenticateMarketer(request);
    if (!marketerPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { phone, payoutMethod, payoutDetails, acceptTerms } = body;

    const updateData: any = {};
    if (phone !== undefined) updateData.phone = phone;
    if (payoutMethod !== undefined) updateData.payoutMethod = payoutMethod;
    if (payoutDetails !== undefined) updateData.payoutDetails = payoutDetails;
    if (acceptTerms) updateData.termsAcceptedAt = new Date();

    const updatedMarketer = await prisma.marketer.update({
      where: { id: marketerPayload.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedMarketer });
  } catch (error) {
    console.error("Failed to update marketer settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
