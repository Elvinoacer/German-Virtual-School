import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";
import { requirePaidSeatReservation } from "@/lib/seat-reservation-guard";

/**
 * Explicitly register for a semester without enrolling in a specific course.
 * Triggers the Semester Fee invoice.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== "STUDENT") {
      return errors.forbidden("Only students can register for semesters");
    }

    const studentId = payload.id || (payload as any).userId;

    try {
      await requirePaidSeatReservation({ userId: studentId });
    } catch (reservationError: unknown) {
      if (
        reservationError instanceof Error &&
        reservationError.message === "PAID_SEAT_RESERVATION_REQUIRED"
      ) {
        return errors.forbidden(
          "A paid seat reservation is required before semester registration.",
        );
      }
      throw reservationError;
    }

    // Check enrollment period before allowing registration
    const systemSettings = await prisma.systemSettings.findUnique({
      where: { id: "system-settings" },
      select: {
        enrollmentStartDate: true,
        enrollmentEndDate: true,
      },
    });

    if (systemSettings) {
      const now = new Date();

      if (
        systemSettings.enrollmentStartDate &&
        now < systemSettings.enrollmentStartDate
      ) {
        return errors.forbidden(
          `Enrollment has not started yet. Registration opens on ${systemSettings.enrollmentStartDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
        );
      }

      if (
        systemSettings.enrollmentEndDate &&
        now > systemSettings.enrollmentEndDate
      ) {
        return errors.forbidden(
          `Enrollment is closed. Registration ended on ${systemSettings.enrollmentEndDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. Please check back for the next enrollment period.`,
        );
      }
    }

    const [currentTerm, billingSettings] = await Promise.all([
      prisma.academicTerm.findFirst({ where: { isCurrent: true } }),
      prisma.globalBillingSettings.findFirst(),
    ]);

    if (!currentTerm) {
      return errors.notFound("No active semester found");
    }

    // Check if already registered
    const existingRegistration = await prisma.termRegistration.findUnique({
      where: {
        studentId_termId: {
          studentId,
          termId: currentTerm.id,
        },
      },
    });

    if (existingRegistration) {
      return errors.conflict("Already registered for this semester");
    }

    // Transaction for registration and invoicing
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create registration record
      const registration = await tx.termRegistration.create({
        data: {
          studentId,
          termId: currentTerm.id,
        },
      });

      const now = new Date();
      const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // 2. Create Semester Fee invoice if fee > 0
      if (billingSettings && Number(billingSettings.defaultFee) > 0) {
        await (tx.invoice as any).create({
          data: {
            studentId,
            termId: currentTerm.id,
            amount: billingSettings.defaultFee,
            description: `Semester Registration Fee: ${currentTerm.name}`,
            dueDate:
              currentTerm.startDate > now ? currentTerm.startDate : dueDate,
            status: "PENDING",
          },
        });
      }

      return registration;
    });

    return successResponse(
      result,
      "Successfully registered for the semester",
      201,
    );
  } catch (error) {
    console.error("Semester registration error:", error);
    return errors.internal("Failed to register for semester");
  }
}
