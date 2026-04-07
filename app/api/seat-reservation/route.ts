import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";
import { IntaSendService } from "@/lib/intasend";

const DEFAULT_RESERVATION_FEE = 2500;

/**
 * POST /api/seat-reservation
 * Creates a seat reservation + Invoice and initiates IntaSend checkout
 */
export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, program, referralCode } =
      await request.json();

    if (!firstName || !lastName || !email) {
      return errors.badRequest("First name, last name, and email are required");
    }

    // Fetch settings for fee amount and intake label
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "system-settings" },
      select: {
        seatReservationFee: true,
        intakeLabel: true,
      },
    });

    const reservationFee = settings?.seatReservationFee
      ? Number(settings.seatReservationFee)
      : DEFAULT_RESERVATION_FEE;

    const intakeLabel = settings?.intakeLabel || "May 2026";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Validate referral code if provided or via cookie
    let codeToUse = referralCode;
    if (!codeToUse) {
      const cookie = request.cookies.get("gvs_referral");
      if (cookie?.value) {
        codeToUse = cookie.value;
      }
    }

    let marketerId: string | null = null;
    let finalReferralCode: string | null = null;
    if (codeToUse && typeof codeToUse === "string" && codeToUse.trim()) {
      const parsedCode = codeToUse.trim().toUpperCase();
      const marketer = await prisma.marketer.findUnique({
        where: { referralCode: parsedCode },
        select: { id: true, isActive: true, email: true },
      });
      // Self-referral prevention: don't credit the marketer if the email matches exactly
      if (
        marketer?.isActive &&
        marketer.email.toLowerCase().trim() !== email.toLowerCase().trim()
      ) {
        marketerId = marketer.id;
        finalReferralCode = parsedCode;
      }
    }

    // Check for existing paid reservation with same email + intake
    const existingReservation = await prisma.seatReservation.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        intakeLabel,
        status: { in: ["PAID", "PENDING"] },
      },
    });

    if (existingReservation?.status === "PAID") {
      return errors.badRequest(
        "You already have a confirmed seat reservation for this intake.",
      );
    }

    // If there's a pending one, reuse it
    if (existingReservation?.status === "PENDING") {
      // Create a new checkout for the existing reservation
      const checkoutData = await IntaSendService.createCheckoutLink({
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase().trim(),
        host: appUrl,
        amount: reservationFee,
        currency: "USD",
        method: "CARD-PAYMENT",
        api_ref: `SEAT_${existingReservation.id}`,
        redirect_url: `${appUrl}/reserve-seat?reservationId=${existingReservation.id}`,
        mobile_tarrif: "BUSINESS-PAYS",
        card_tarrif: "BUSINESS-PAYS",
      });

      return successResponse(
        {
          reservationId: existingReservation.id,
          checkoutUrl: checkoutData.url,
          checkoutId: checkoutData.id,
          amount: reservationFee,
        },
        "Checkout link created for existing reservation",
      );
    }

    // Create new reservation
    const reservation = await prisma.seatReservation.create({
      data: {
        email: email.toLowerCase().trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || null,
        program: program || null,
        amount: reservationFee,
        status: "PENDING",
        intakeLabel,
        referralCode: finalReferralCode,
        marketerId,
      },
    });

    // Create IntaSend checkout
    const checkoutData = await IntaSendService.createCheckoutLink({
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase().trim(),
      host: appUrl,
      amount: reservationFee,
      currency: "USD",
      method: "CARD-PAYMENT",
      api_ref: `SEAT_${reservation.id}`,
      redirect_url: `${appUrl}/reserve-seat?reservationId=${reservation.id}`,
      mobile_tarrif: "BUSINESS-PAYS",
      card_tarrif: "BUSINESS-PAYS",
    });

    return successResponse(
      {
        reservationId: reservation.id,
        checkoutUrl: checkoutData.url,
        checkoutId: checkoutData.id,
        amount: reservationFee,
      },
      "Seat reservation created. Complete payment to confirm.",
    );
  } catch (error: any) {
    console.error("Seat reservation error:", error);
    return errors.internal(
      error.message || "Failed to create seat reservation",
    );
  }
}

/**
 * GET /api/seat-reservation
 * Get reservation status by email (public) or list all (admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const reservationId = searchParams.get("id");

    if (reservationId) {
      const reservation = await prisma.seatReservation.findUnique({
        where: { id: reservationId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          program: true,
          amount: true,
          status: true,
          intakeLabel: true,
          createdAt: true,
        },
      });

      if (!reservation) {
        return errors.notFound("Reservation not found");
      }

      return successResponse(reservation);
    }

    if (email) {
      const reservations = await prisma.seatReservation.findMany({
        where: { email: email.toLowerCase().trim() },
        select: {
          id: true,
          program: true,
          amount: true,
          status: true,
          intakeLabel: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return successResponse(reservations);
    }

    return errors.badRequest("Please provide an email or reservation ID");
  } catch (error: any) {
    console.error("Get reservation error:", error);
    return errors.internal("Failed to fetch reservation");
  }
}
