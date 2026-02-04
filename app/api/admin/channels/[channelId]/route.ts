import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ channelId: string }>;
}

// DELETE - Deactivate a channel (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== "ADMIN") {
      return errors.forbidden("Only admins can delete channels");
    }

    const { channelId } = await params;

    const channel = await prisma.communicationChannel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return errors.notFound("Channel not found");
    }

    // Soft delete - mark as inactive
    await prisma.communicationChannel.update({
      where: { id: channelId },
      data: { isActive: false },
    });

    return successResponse({ channelId }, "Channel deactivated successfully");
  } catch (error) {
    console.error("Delete channel error:", error);
    return errors.internal("Failed to delete channel");
  }
}

// PATCH - Update channel or reactivate
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== "ADMIN") {
      return errors.forbidden("Only admins can update channels");
    }

    const { channelId } = await params;
    const body = await request.json();
    const { name, link, description, iconUrl, isActive, isPublic } = body;

    const channel = await prisma.communicationChannel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return errors.notFound("Channel not found");
    }

    const updatedChannel = await prisma.communicationChannel.update({
      where: { id: channelId },
      data: {
        ...(name && { name }),
        ...(link && { link }),
        ...(description !== undefined && { description }),
        ...(iconUrl !== undefined && { iconUrl }),
        ...(isActive !== undefined && { isActive }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return successResponse({ channel: updatedChannel }, "Channel updated successfully");
  } catch (error) {
    console.error("Update channel error:", error);
    return errors.internal("Failed to update channel");
  }
}
