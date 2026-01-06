import { auth } from '@/lib/auth.config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get authenticated session from NextAuth
 */
export async function getSession() {
  return await auth();
}

/**
 * Middleware to authenticate API requests
 */
export async function authenticate(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  // Ensure both id and userId are present for compatibility
  const user = session.user as any;
  if (user.id && !user.userId) user.userId = user.id;
  if (user.userId && !user.id) user.id = user.userId;

  return session.user;
}

/**
 * Check if user has required role
 */
export function requireRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

// Rest of the auth-middleware functions remain the same
export async function canAccessResource(
  userId: string,
  resourceOwnerId: string,
  userRole: string
): Promise<boolean> {
  return userId === resourceOwnerId || userRole === 'ADMIN';
}

export async function isStudentEnrolled(
  studentId: string,
  courseId: string
): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma');
  
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId,
      courseId,
      status: { in: ['ACTIVE', 'COMPLETED'] },
    },
  });

  return !!enrollment;
}

export async function isTeacherOfCourse(
  teacherId: string,
  courseId: string
): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma');
  
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      teacherId,
    },
  });

  return !!course;
}
