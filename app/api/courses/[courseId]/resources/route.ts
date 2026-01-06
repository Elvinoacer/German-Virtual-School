import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    
    // Access control
    const { auth } = await import('@/lib/auth.config');
    const session = await auth();
    
    if (!session) {
      return errors.unauthorized();
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return errors.unauthorized();
    }

    // Admins see everything
    if (user.role !== 'ADMIN') {
      // Teachers see their own courses
      if (user.role === 'TEACHER') {
        const course = await prisma.course.findUnique({
          where: { id: courseId }
        });
        if (course?.teacherId !== user.id) {
          return errors.forbidden('You do not have access to these resources');
        }
      } else if (user.role === 'STUDENT') {
        // Students must be enrolled
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: user.id,
              courseId
            }
          }
        });
        if (!enrollment) {
          return errors.forbidden('You must be enrolled to access these resources');
        }
      }
    }

    const resources = await prisma.resource.findMany({
      where: { 
        module: {
          courseId
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(resources);
  } catch (error) {
    console.error("Get resources error:", error);
    return errors.internal("Failed to fetch resources");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    
    // Access control
    const { authenticate } = await import('@/lib/auth-middleware');
    const payload = await authenticate(request);

    if (payload.role !== 'TEACHER' && payload.role !== 'ADMIN') {
      return errors.forbidden('Only teachers and admins can create resources');
    }

    if (payload.role === 'TEACHER') {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (course?.teacherId !== payload.id) {
        return errors.forbidden('You can only add resources to your own courses');
      }
    }

    const body = await request.json();
    const { title, url, type, description, moduleId, isDownloadable } = body;
    
    if (!title || !url || !type || !moduleId) {
      return errors.badRequest("Missing required fields (title, url, type, moduleId)");
    }

    // Verify module belongs to course
    const module = await prisma.module.findFirst({
      where: { id: moduleId, courseId }
    });

    if (!module) {
      return errors.badRequest("Module does not belong to this course");
    }

    const resource = await prisma.resource.create({
      data: {
        moduleId,
        title,
        description,
        url,
        type,
        isDownloadable: isDownloadable !== undefined ? isDownloadable : true,
      },
    });
    return successResponse(resource);
  } catch (error) {
    console.error("Create resource error:", error);
    return errors.internal("Failed to create resource");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    // Access control
    const { authenticate } = await import('@/lib/auth-middleware');
    const payload = await authenticate(request);

    if (payload.role !== 'TEACHER' && payload.role !== 'ADMIN') {
      return errors.forbidden('Only teachers and admins can update resources');
    }

    if (payload.role === 'TEACHER') {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (course?.teacherId !== payload.id) {
        return errors.forbidden('You can only update resources in your own courses');
      }
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) {
      return errors.badRequest("Resource id required");
    }
    
    // Verify resource belongs to course
    const resourceCheck = await prisma.resource.findFirst({
      where: { id, module: { courseId } }
    });

    if (!resourceCheck) {
      return errors.notFound("Resource not found in this course");
    }

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        title: updateData.title,
        description: updateData.description,
        url: updateData.url,
        type: updateData.type,
        isDownloadable: updateData.isDownloadable,
        version: { increment: 1 },
      },
    });
    return successResponse(resource);
  } catch (error) {
    console.error("Update resource error:", error);
    return errors.internal("Failed to update resource");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    
    // Access control: Enrolled students, teacher, or admin
    const { authenticate } = await import('@/lib/auth-middleware');
    const payload = await authenticate(request);

    if (payload.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: payload.id,
            courseId
          }
        }
      });
      if (!enrollment) {
        return errors.forbidden('You must be enrolled to track resources');
      }
    } else if (payload.role === 'TEACHER') {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (course?.teacherId !== payload.id) {
        return errors.forbidden('You can only track resources in your own courses');
      }
    } else if (payload.role !== 'ADMIN') {
      return errors.unauthorized();
    }

    const body = await request.json();
    const { id, action } = body; // action: 'view' | 'download'

    if (!id || !action) {
      return errors.badRequest("Resource id and action required");
    }

    // Verify resource belongs to course
    const resourceCheck = await prisma.resource.findFirst({
      where: { id, module: { courseId } }
    });

    if (!resourceCheck) {
      return errors.notFound("Resource not found in this course");
    }

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        viewCount: action === "view" ? { increment: 1 } : undefined,
        downloadCount: action === "download" ? { increment: 1 } : undefined,
      },
    });

    return successResponse(resource);
  } catch (error) {
    console.error("Update resource analytics error:", error);
    return errors.internal("Failed to update analytics");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    // Access control
    const { authenticate } = await import('@/lib/auth-middleware');
    const payload = await authenticate(request);

    if (payload.role !== 'TEACHER' && payload.role !== 'ADMIN') {
      return errors.forbidden('Only teachers and admins can delete resources');
    }

    if (payload.role === 'TEACHER') {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (course?.teacherId !== payload.id) {
        return errors.forbidden('You can only delete resources in your own courses');
      }
    }

    const { id } = await request.json();
    if (!id) {
      return errors.badRequest("Resource id required");
    }

    // Verify resource belongs to course
    const resourceCheck = await prisma.resource.findFirst({
      where: { id, module: { courseId } }
    });

    if (!resourceCheck) {
      return errors.notFound("Resource not found in this course");
    }

    await prisma.resource.delete({
      where: { id },
    });
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Delete resource error:", error);
    return errors.internal("Failed to delete resource");
  }
}