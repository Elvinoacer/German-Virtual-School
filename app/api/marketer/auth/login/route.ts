import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { createMarketerToken, MARKETER_COOKIE_NAME } from '@/lib/marketer-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const marketer = await prisma.marketer.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!marketer) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!marketer.isActive) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact admin.' },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, marketer.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = createMarketerToken({
      id: marketer.id,
      email: marketer.email,
      firstName: marketer.firstName,
      lastName: marketer.lastName,
      referralCode: marketer.referralCode,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: marketer.id,
        firstName: marketer.firstName,
        lastName: marketer.lastName,
        email: marketer.email,
        referralCode: marketer.referralCode,
      },
    });

    response.cookies.set(MARKETER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Marketer login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
