import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    const userId = payload.userId;
    const role = payload.role;

    let contacts = [];

    if (role === 'TEACHER') {
        // Fetch all students enrolled in courses taught by this teacher
        const courses = await prisma.course.findMany({
            where: { teacherId: userId },
            select: { id: true }
        });

        const courseIds = courses.map(c => c.id);

        const enrollments = await prisma.enrollment.findMany({
            where: { courseId: { in: courseIds } },
            select: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        avatarUrl: true,
                        image: true
                    }
                }
            }
        });

        // Unique students
        const studentMap = new Map();
        enrollments.forEach(e => {
            if (!studentMap.has(e.student.id)) {
                studentMap.set(e.student.id, e.student);
            }
        });
        contacts = Array.from(studentMap.values());

    } else if (role === 'STUDENT') {
        // Fetch teachers of courses enrolled by this student
        // AND other students in the same courses
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId: userId },
            include: {
                course: {
                    select: {
                        id: true,
                        teacher: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                role: true,
                                avatarUrl: true,
                                image: true
                            }
                        }
                    }
                }
            }
        });

        const myCourseIds = enrollments.map(e => e.course.id);
        const teachers = enrollments.map(e => e.course.teacher);

        // Find classmates
        const classmatesEnrollments = await prisma.enrollment.findMany({
            where: { 
                courseId: { in: myCourseIds },
                studentId: { not: userId } 
            },
            select: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        avatarUrl: true,
                        image: true
                    }
                }
            }
        });

        const classmates = classmatesEnrollments.map(e => e.student);

        // Merge and unique
        const contactMap = new Map();
        
        teachers.forEach(t => contactMap.set(t.id, t));
        classmates.forEach(s => contactMap.set(s.id, s));

        contacts = Array.from(contactMap.values());
    } else {
        // Admin or other: maybe fetch everyone? For now empty or restricted.
        return successResponse([]);
    }

    // Sort by name
    contacts.sort((a, b) => (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName));

    return successResponse(contacts);

  } catch (error) {
    console.error('Fetch contacts error:', error);
    return errors.internal('Failed to fetch contacts');
  }
}
