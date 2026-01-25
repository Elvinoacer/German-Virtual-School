import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendEmailNotification } from '@/lib/notifications/channels/email';

/**
 * POST /api/auth/resend-verification
 * 
 * Resends the verification email for a user.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, emailVerified: true }
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { success: true, message: 'If that email is registered, a verification link has been sent.' },
        { status: 200 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    // Generate new token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;
    
    await sendEmailNotification({
      userId: user.id,
      title: 'Verify Your Email - German Virtual School',
      message: 'Please verify your email address.',
      email: {
        to: email,
        subject: 'Verify Your Email - German Virtual School',
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a4d8f;">Email Verification</h1>
            <p>Dear ${user.firstName || 'User'},</p>
            <p>Please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; padding: 14px 32px; background-color: #1a4d8f; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Verify My Email
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #1a4d8f; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              This link expires in 24 hours.
            </p>
          </div>
        `,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Verification email sent' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
