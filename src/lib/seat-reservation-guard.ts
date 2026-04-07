import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "system-settings";
const DEFAULT_INTAKE_LABEL = "May 2026";

function normalizeEmail(email?: string | null): string | null {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();
  return normalized.length > 0 ? normalized : null;
}

export async function getCurrentIntakeLabel(): Promise<string> {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: SETTINGS_ID },
    select: { intakeLabel: true },
  });

  return settings?.intakeLabel || DEFAULT_INTAKE_LABEL;
}

export async function findPaidSeatReservation({
  email,
  userId,
  intakeLabel,
}: {
  email?: string | null;
  userId?: string | null;
  intakeLabel?: string | null;
}) {
  let resolvedEmail = normalizeEmail(email);

  if (!resolvedEmail && userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    resolvedEmail = normalizeEmail(user?.email);
  }

  const orFilters: Array<{ email?: string; userId?: string }> = [];

  if (resolvedEmail) {
    orFilters.push({ email: resolvedEmail });
  }

  if (userId) {
    orFilters.push({ userId });
  }

  if (orFilters.length === 0) {
    return null;
  }

  const effectiveIntakeLabel = intakeLabel || (await getCurrentIntakeLabel());

  return prisma.seatReservation.findFirst({
    where: {
      intakeLabel: effectiveIntakeLabel,
      status: "PAID",
      OR: orFilters,
    },
    select: {
      id: true,
      email: true,
      userId: true,
      intakeLabel: true,
    },
  });
}

export async function hasPaidSeatReservation(params: {
  email?: string | null;
  userId?: string | null;
  intakeLabel?: string | null;
}): Promise<boolean> {
  const reservation = await findPaidSeatReservation(params);
  return Boolean(reservation);
}

export async function requirePaidSeatReservation(params: {
  email?: string | null;
  userId?: string | null;
  intakeLabel?: string | null;
}) {
  const reservation = await findPaidSeatReservation(params);

  if (!reservation) {
    const error = new Error("PAID_SEAT_RESERVATION_REQUIRED");
    (error as Error & { code?: string }).code =
      "PAID_SEAT_RESERVATION_REQUIRED";
    throw error;
  }

  return reservation;
}
