
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: 'TEACHER',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    });

    const formattedTeachers = teachers.map(t => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`,
      avatarUrl: t.avatarUrl
    }));

    return successResponse(formattedTeachers);
  } catch (error) {
    console.error('Fetch teachers error:', error);
    return errors.internal('Failed to fetch teachers');
  }
}
