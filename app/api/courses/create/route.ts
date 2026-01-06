
import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { CourseLevel, CourseStatus, NotificationType, UserRole } from '@/generated/prisma/enums';
import { notify } from '@/lib/notifications/orchestrator';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and check role
    const payload = await authenticate(request);

    if (payload.role !== 'TEACHER') {
      return errors.forbidden('Only teachers can create courses');
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      level, 
      language, 
      thumbnailUrl, 
      price, 
      durationWeeks,
      outcomes,
      modules 
    } = body;

    // Validation
    if (!title || !description || !level || price === undefined || durationWeeks === undefined) {
      return errors.badRequest('Missing required fields');
    }

    // Generate slug
    let slug = generateSlug(title);
    
    // Ensure unique slug
    let counter = 1;
    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${generateSlug(title)}-${counter}`;
      counter++;
    }

    // Create course with nested modules and resources
    const course = await prisma.course.create({
      data: {
        teacherId: payload.id,
        title,
        slug,
        description,
        level: level as CourseLevel,
        status: CourseStatus.PUBLISHED,
        language: language || 'German',
        thumbnailUrl,
        price,
        durationWeeks,
        outcomes: outcomes || [],
        modules: {
          create: modules?.map((module: any, mIndex: number) => ({
            title: module.title,
            description: module.description,
            orderIndex: mIndex,
            resources: {
              create: module.lessons?.map((lesson: any) => ({
                title: lesson.title,
                description: lesson.description,
                type: lesson.type || 'VIDEO',
                url: lesson.url || '',
              }))
            }
          }))
        }
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        modules: {
          include: {
            resources: true
          }
        }
      },
    });

    // Notify all students about the new course
    try {
        const students = await prisma.user.findMany({
            where: { role: UserRole.STUDENT },
            select: { id: true, email: true, fcmTokens: true }
        });

        const notifications = students.map(student => 
            notify({
                userId: student.id,
                title: `New Course Available: ${title}`,
                message: `Check out our new course "${title}" - ${description.substring(0, 50)}...`,
                type: NotificationType.INFO,
                email: { to: student.email },
                push: { tokens: student.fcmTokens },
                metadata: {
                    link: `/courses/${course.id}`,
                    courseId: course.id
                }
            })
        );
        await Promise.allSettled(notifications);
    } catch (err) {
        console.error("Failed to send course notifications", err);
    }

    return successResponse(course, 'Course created successfully', 201);
  } catch (error) {
    console.error('Create course error:', error);
    return errors.internal('Failed to create course');
  }
}
