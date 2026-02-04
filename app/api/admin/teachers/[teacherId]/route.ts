import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

// GET - Fetch single teacher details for admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const payload = await authenticate(request);
    
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Access denied');
    }

    const { teacherId } = await params;

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId, role: 'TEACHER' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        image: true,
        isVerified: true,
        createdAt: true,
        teacherProfile: true,
        createdCourses: {
          select: {
            id: true,
            title: true,
            level: true,
            price: true,
            status: true,
            createdAt: true,
            _count: {
              select: { enrollments: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!teacher) {
      return errors.notFound('Teacher not found');
    }

    // Calculate stats
    const totalCourses = teacher.createdCourses.length;
    const activeCourses = teacher.createdCourses.filter(c => c.status === 'PUBLISHED').length;
    const totalStudents = teacher.createdCourses.reduce((sum: number, c) => sum + c._count.enrollments, 0);

    return successResponse({
      ...teacher,
      stats: {
        totalCourses,
        activeCourses,
        totalStudents,
      }
    });

  } catch (error) {
    console.error('Admin teacher detail error:', error);
    return errors.internal('Failed to fetch teacher details');
  }
}
