import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== "ADMIN") {
      return errors.forbidden("Access denied");
    }

    const { id } = await params;

    if (!id) {
      return errors.badRequest("Meeting ID is required");
    }

    // Check if meeting exists
    const meeting = await prisma.adminMeeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      return errors.notFound("Meeting not found");
    }

    // Delete meeting (cascade delete will handle invitees if configured in schema, 
    // otherwise we might need to delete invitees first, but usually cascade is set)
    await prisma.adminMeeting.delete({
      where: { id },
    });

    return successResponse(null, "Meeting deleted successfully");
  } catch (error) {
    console.error("Delete admin meeting error:", error);
    return errors.internal("Failed to delete meeting");
  }
}
