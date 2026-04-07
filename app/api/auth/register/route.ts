import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { UserRole } from "@/generated/prisma/client";
import { randomBytes } from "crypto";
import { sendEmailNotification } from "@/lib/notifications/channels/email";
import { hasPaidSeatReservation } from "@/lib/seat-reservation-guard";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      interestedProgram,
      referralCode,
    } = body;

    // Validation
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (!["STUDENT", "TEACHER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check enrollment period for student registration
    if (role === "STUDENT") {
      const settings = await prisma.systemSettings.findUnique({
        where: { id: "system-settings" },
        select: {
          enrollmentStartDate: true,
          enrollmentEndDate: true,
          intakeLabel: true,
        },
      });

      if (settings) {
        const now = new Date();

        if (
          settings.enrollmentStartDate &&
          now < settings.enrollmentStartDate
        ) {
          return NextResponse.json(
            {
              error: `Enrollment has not started yet. Registration opens on ${settings.enrollmentStartDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
            },
            { status: 403 },
          );
        }

        if (settings.enrollmentEndDate && now > settings.enrollmentEndDate) {
          return NextResponse.json(
            {
              error: `Enrollment is closed. Registration ended on ${settings.enrollmentEndDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. Please check back for the next enrollment period.`,
            },
            { status: 403 },
          );
        }

        // New Logic: Mandatory Seat Reservation Check
        const intakeLabel = settings.intakeLabel || "May 2026";
        const paidReservation = await hasPaidSeatReservation({
          email,
          intakeLabel,
        });

        if (!paidReservation) {
          return NextResponse.json(
            {
              error: `No paid seat reservation found for ${email} (${intakeLabel} intake). Please reserve your seat first.`,
              needsReservation: true,
            },
            { status: 403 },
          );
        }
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    // Resolve Referral Code to Marketer ID
    let referredByMarketerId: string | undefined = undefined;
    let codeToUse = referralCode;

    if (!codeToUse) {
      const cookie = request.cookies.get("gvs_referral");
      if (cookie?.value) {
        codeToUse = cookie.value;
      }
    }

    if (codeToUse) {
      const marketer = await prisma.marketer.findUnique({
        where: { referralCode: codeToUse.toUpperCase().trim() },
        select: { id: true },
      });
      if (marketer) {
        referredByMarketerId = marketer.id;
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user (emailVerified = null by default)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        role: role as UserRole,
        referredByMarketerId,
        // emailVerified is null by default, meaning not verified
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
      },
    });

    // Create role-specific profile
    if (role === "STUDENT") {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          interestedProgram: interestedProgram
            ? (interestedProgram as any)
            : undefined,
        },
      });

      // Link any existing PAID seat reservations to this new user
      try {
        await prisma.seatReservation.updateMany({
          where: {
            email: email.toLowerCase().trim(),
            status: "PAID",
            userId: null,
          },
          data: { userId: user.id },
        });
      } catch (linkError) {
        console.error(
          "Failed to link seat reservations (non-fatal):",
          linkError,
        );
      }
    } else if (role === "TEACHER") {
      await prisma.teacherProfile.create({
        data: { userId: user.id },
      });
    }

    // Generate verification token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;

    await sendEmailNotification({
      userId: user.id,
      title: "Verify Your Email - German Virtual School",
      message: `Please verify your email address to complete your registration.`,
      email: {
        to: email,
        subject: "Verify Your Email - German Virtual School",
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a4d8f;">Welcome to German Virtual School!</h1>
            <p>Dear ${firstName},</p>
            <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; padding: 14px 32px; background-color: #1a4d8f; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Verify My Email
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #1a4d8f; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.
            </p>
          </div>
        `,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: { user },
        message:
          "Registration successful. Please check your email to verify your account.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
