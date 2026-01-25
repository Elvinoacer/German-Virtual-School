import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/verify-email?token=...
 * 
 * Validates the email verification token and marks the user's email as verified.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/login?error=missing_token', request.url)
      );
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL('/login?error=invalid_token', request.url)
      );
    }

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token }
      });
      return NextResponse.redirect(
        new URL('/login?error=token_expired', request.url)
      );
    }

    // The identifier is the user's email
    const email = verificationToken.identifier;

    // Update the user's emailVerified field
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { token }
    });

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL('/login?verified=true', request.url)
    );

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(
      new URL('/login?error=verification_failed', request.url)
    );
  }
}
