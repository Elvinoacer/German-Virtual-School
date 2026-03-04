import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let isUnique = false;
    let newCode = "";

    // Keep generating until a unique code is found
    while (!isUnique) {
      // Generate a code like MKTR-4B9A
      newCode = `MKTR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const existing = await prisma.marketer.findUnique({
        where: { referralCode: newCode },
        select: { id: true }
      });

      if (!existing) {
        isUnique = true;
      }
    }

    return NextResponse.json({ success: true, code: newCode }, { status: 200 });
  } catch (error) {
    console.error("Generate referral code error:", error);
    return NextResponse.json(
      { error: "Failed to generate referral code" },
      { status: 500 }
    );
  }
}
