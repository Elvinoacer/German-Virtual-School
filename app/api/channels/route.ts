import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

// GET - Get all active channels (public route)
export async function GET(request: NextRequest) {
  try {
    const channels = await prisma.communicationChannel.findMany({
      where: { 
        isActive: true,
        isPublic: true 
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        link: true,
        description: true,
        iconUrl: true,
        createdAt: true,
      },
    });

    return successResponse({ channels }, "Channels retrieved successfully");
  } catch (error) {
    console.error("Get public channels error:", error);
    return errors.internal("Failed to retrieve channels");
  }
}
