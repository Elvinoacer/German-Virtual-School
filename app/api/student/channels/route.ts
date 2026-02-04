import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

// GET - Get all active channels (public + private) for authenticated students/teachers
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    // Allow students, teachers, and admins
    if (!["STUDENT", "TEACHER", "ADMIN"].includes(payload.role)) {
      return errors.forbidden("Access restricted to enrolled users");
    }

    const channels = await prisma.communicationChannel.findMany({
      where: { isActive: true }, // Returns both public and private
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        link: true,
        description: true,
        iconUrl: true,
        isPublic: true,
        createdAt: true,
      },
    });

    return successResponse({ channels }, "All active channels retrieved successfully");
  } catch (error) {
    console.error("Get student channels error:", error);
    return errors.internal("Failed to retrieve channels");
  }
}
