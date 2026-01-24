
import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return errors.badRequest("Token is required");
    }

    // Remove token from user's fcmTokens array
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { fcmTokens: true },
    });

    if (!user) {
      return errors.notFound("User not found");
    }

    const currentTokens = user.fcmTokens || [];
    const updatedTokens = currentTokens.filter((t) => t !== token);

    if (updatedTokens.length !== currentTokens.length) {
      await prisma.user.update({
        where: { id: payload.userId },
        data: {
          fcmTokens: updatedTokens,
        },
      });
      console.log(`[UnregisterPush] Token removed for user: ${payload.userId}`);
    }

    return successResponse({ success: true }, "Token unregistered");
  } catch (error) {
    console.error("Token unregistration error:", error);
    return errors.internal("Failed to unregister token");
  }
}
