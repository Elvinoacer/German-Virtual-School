import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

// POST - Complete student profile
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request) as any;
    console.log("[DEBUG] payload from authenticate:", JSON.stringify(payload, null, 2));

    const userId = payload.userId || payload.id;
    console.log("[DEBUG] Using userId for profile completion:", userId);

    if (!userId) {
      return errors.badRequest("User ID missing from session");
    }

    if (payload.role !== "STUDENT") {
      return errors.forbidden("Only students can complete their profile");
    }

    // Verify user exists in DB to debug foreign key error
    const dbUserVerify = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    });

    if (!dbUserVerify) {
      console.error("[ERROR] User not found in DB for ID:", userId);
      return errors.unauthorized(`User record not found for ID: ${userId}`);
    }

    console.log("[DEBUG] User confirmed in DB:", dbUserVerify.email);

    const body = await request.json();
    const { dateOfBirth, phoneNumber, address, emergencyContact } = body;

    // Validate required fields
    if (!dateOfBirth || !phoneNumber) {
      return errors.badRequest("Date of birth and phone number are required");
    }

    // Create or update student profile
    await prisma.studentProfile.upsert({
      where: { userId: userId },
      update: {
        dateOfBirth: new Date(dateOfBirth),
        phoneNumber,
        address: address || null,
        emergencyContact: emergencyContact || null,
      },
      create: {
        userId: userId,
        dateOfBirth: new Date(dateOfBirth),
        phoneNumber,
        address: address || null,
        emergencyContact: emergencyContact || null,
      },
    });

    // Mark user as onboarding complete
    await prisma.user.update({
      where: { id: userId },
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
