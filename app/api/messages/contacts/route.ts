import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

/**
 * GET /api/messages/contacts
 * 
 * Returns contacts for messaging, prioritizing faculty (teachers/admins) first,
 * then paginated students. Supports search filtering.
 * 
 * Query params:
 * - search: Filter by firstName or lastName (optional)
 * - page: Page number for students pagination (default: 1)
 * - limit: Items per page for students (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    const userId = payload.userId;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = search.trim() 
      ? {
          OR: [
            { firstName: { contains: search.trim(), mode: 'insensitive' as const } },
            { lastName: { contains: search.trim(), mode: 'insensitive' as const } },
          ]
        }
      : {};

    // Exclude self from all results
    const excludeSelf = { id: { not: userId } };

    // 1. Fetch ALL faculty (teachers and admins) - no pagination
    const faculty = await prisma.user.findMany({
      where: {
        ...excludeSelf,
        ...searchFilter,
        role: { in: ['TEACHER', 'ADMIN'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        image: true,
      },
      orderBy: [
        { role: 'asc' }, // ADMIN comes before TEACHER alphabetically
        { firstName: 'asc' },
        { lastName: 'asc' },
      ],
    });

    // 2. Fetch paginated students
    const [students, totalStudents] = await Promise.all([
      prisma.user.findMany({
        where: {
          ...excludeSelf,
          ...searchFilter,
          role: 'STUDENT',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          avatarUrl: true,
          image: true,
        },
        orderBy: [
          { firstName: 'asc' },
          { lastName: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: {
          ...excludeSelf,
          ...searchFilter,
          role: 'STUDENT',
        },
      }),
    ]);

    return successResponse({
      faculty,
      students,
      pagination: {
        page,
        limit,
        total: totalStudents,
        totalPages: Math.ceil(totalStudents / limit),
      },
    });

  } catch (error) {
    console.error('Fetch contacts error:', error);
    return errors.internal('Failed to fetch contacts');
  }
}
