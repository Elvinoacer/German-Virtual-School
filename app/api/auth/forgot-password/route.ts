import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendEmailNotification } from "@/lib/notifications/channels/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user not found to prevent enumeration
      return NextResponse.json({ success: true });
    }

    // Generate reset token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

    // Save token to DB
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Send email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    
    await sendEmailNotification({
      email: {
        to: email,
        subject: "Reset Your Password - German Virtual School",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Reset Your Password</h1>
            <p>You requested a password reset for your German Virtual School account.</p>
            <p>Click the link below to set a new password. This link is valid for 1 hour.</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
            <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
        text: `Reset your password by visiting this link: ${resetLink}`,
      },
      title: "Reset Your Password",
      message: `Reset link: ${resetLink}`,
      type: "INFO",
      userId: user.id
    });

    console.log(`[ForgotPassword] Reset link sent to ${email}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
