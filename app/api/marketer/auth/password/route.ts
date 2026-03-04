import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateMarketer } from "@/lib/marketer-auth";
import { verifyPassword, hashPassword } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const marketerPayload = await authenticateMarketer(request);
    if (!marketerPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 });
    }

    const marketer = await prisma.marketer.findUnique({
      where: { id: marketerPayload.id },
    });

    if (!marketer) {
      return NextResponse.json({ error: "Marketer not found" }, { status: 404 });
    }

    const isValid = await verifyPassword(currentPassword, marketer.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.marketer.update({
      where: { id: marketer.id },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Failed to change password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
