import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, page } = body;

    if (!referralCode) {
      return NextResponse.json({ error: "Missing referralCode" }, { status: 400 });
    }

    // Find the marketer first
    const marketer = await prisma.marketer.findUnique({
      where: { referralCode: referralCode.toUpperCase().trim() },
    });

    if (!marketer) {
      // Return 200 to not break the frontend, but don't track invalid codes
      return NextResponse.json({ success: false, message: "Invalid code" });
    }

    // Optionally get IP and UserAgent (best effort)
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Track the click in DB
    await prisma.referralClick.create({
      data: {
        marketerId: marketer.id,
        ipAddress: ipAddress.substring(0, 45), // IPv6 max length
        userAgent: userAgent.substring(0, 500),
        page: page || "/",
      },
    });

    // Increment total clicks on marketer profile (using atomic increment)
    await prisma.marketer.update({
      where: { id: marketer.id },
      data: { totalClicks: { increment: 1 } },
    });

    // We can also set a 30-day cookie for attribution if it's called from a Server-side setting
    // But since this is a POST from client side, we create a response with Set-Cookie
    const response = NextResponse.json({ success: true });
    
    // 30 days expiry
    response.cookies.set("gvs_referral", marketer.referralCode, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      httpOnly: false, // Accessible to JS if needed, though mostly used by API
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Failed to track referral:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
