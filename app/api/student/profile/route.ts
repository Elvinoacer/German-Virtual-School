import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

// GET - Get student profile data
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== "STUDENT") {
      return errors.forbidden("Only students can access this endpoint");
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: payload.userId },
      select: {
        id: true,
        dateOfBirth: true,
        phoneNumber: true,
        address: true,
        emergencyContact: true,
      },
    });

    // Return empty object if no profile exists yet
    return successResponse(profile || {
      dateOfBirth: null,
      phoneNumber: null,
      address: null,
      emergencyContact: null,
    });
  } catch (error) {
    console.error("Get student profile error:", error);
    return errors.internal("Failed to get profile");
  }
}
