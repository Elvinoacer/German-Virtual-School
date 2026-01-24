import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== "ADMIN") {
      return errors.forbidden("Access denied");
    }

    const broadcasts = await prisma.broadcast.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    });

    return successResponse(broadcasts);
  } catch (error) {
    console.error("Get broadcasts error:", error);
    return errors.internal("Failed to fetch broadcast history");
  }
}
