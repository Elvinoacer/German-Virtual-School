import { NextRequest, NextResponse } from 'next/server';
import { authenticateMarketer, MARKETER_COOKIE_NAME } from '@/lib/marketer-auth';

export async function GET(request: NextRequest) {
  try {
    const marketer = await authenticateMarketer(request);
    return NextResponse.json({ success: true, data: marketer });
  } catch {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.set(MARKETER_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
