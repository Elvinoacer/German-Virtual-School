import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const MARKETER_JWT_SECRET = process.env.MARKETER_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'marketer-secret-fallback';
const MARKETER_COOKIE_NAME = 'gvs_marketer_token';

interface MarketerPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  referralCode: string;
}

/**
 * Create a JWT token for a marketer
 */
export function createMarketerToken(marketer: MarketerPayload): string {
  return jwt.sign(
    {
      id: marketer.id,
      email: marketer.email,
      firstName: marketer.firstName,
      lastName: marketer.lastName,
      referralCode: marketer.referralCode,
    },
    MARKETER_JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Authenticate a marketer from the request cookie
 */
export async function authenticateMarketer(request: NextRequest): Promise<MarketerPayload> {
  const token = request.cookies.get(MARKETER_COOKIE_NAME)?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const decoded = jwt.verify(token, MARKETER_JWT_SECRET) as MarketerPayload;

    // Verify marketer still exists and is active
    const marketer = await prisma.marketer.findUnique({
      where: { id: decoded.id },
      select: { id: true, isActive: true },
    });

    if (!marketer || !marketer.isActive) {
      throw new Error('Marketer not found or deactivated');
    }

    return decoded;
  } catch {
    throw new Error('Invalid or expired token');
  }
}

export { MARKETER_COOKIE_NAME };
