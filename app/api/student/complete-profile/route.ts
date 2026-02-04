import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

// POST - Complete student profile
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== "STUDENT") {
      return errors.forbidden("Only students can complete their profile");
    }

    const body = await request.json();
    const { dateOfBirth, phoneNumber, address, emergencyContact } = body;

    // Validate required fields
    if (!dateOfBirth || !phoneNumber) {
      return errors.badRequest("Date of birth and phone number are required");
    }

    // Create or update student profile
    await prisma.studentProfile.upsert({
      where: { userId: payload.userId },
      update: {
        dateOfBirth: new Date(dateOfBirth),
        phoneNumber,
        address: address || null,
        emergencyContact: emergencyContact || null,
      },
      create: {
        userId: payload.userId,
        dateOfBirth: new Date(dateOfBirth),
        phoneNumber,
        address: address || null,
        emergencyContact: emergencyContact || null,
      },
    });

    // Mark user as onboarding complete
    await prisma.user.update({
      where: { id: payload.userId },
      data: { onboardingComplete: true },
    });

    return successResponse(
      { onboardingComplete: true },
      "Profile completed successfully. An administrator will review your account."
    );
  } catch (error) {
    console.error("Complete profile error:", error);
    return errors.internal("Failed to complete profile");
  }
}
